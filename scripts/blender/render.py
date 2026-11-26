"""Fabrique les vidéos d'exercices avec Blender.

Usage :
  node scripts/export-frames.mjs            # positions 3D -> /tmp/kettle-frames/frames.json
  python3 scripts/blender/render.py [ids]   # images -> /tmp/kettle-render/<id>/
  (puis scripts/blender/encode.sh pour faire les .mp4)

Mannequin 3D vu de trois quarts : côté droit clair, côté gauche plus foncé,
haut du corps bleu, kettlebell orange.
"""
import json
import math
import os
import sys

import bpy
from mathutils import Vector

FRAMES = '/tmp/kettle-frames/frames.json'
OUT = '/tmp/kettle-render'
RES = (480, 360)
CM = 0.01

COL = {
    'right': (0.93, 0.94, 0.96, 1),
    'left': (0.33, 0.37, 0.46, 1),
    'torso': (0.05, 0.24, 0.75, 1),
    'pelvis': (0.12, 0.15, 0.22, 1),
    'skin': (0.96, 0.84, 0.74, 1),
    'hair': (0.15, 0.12, 0.10, 1),
    'kb': (1.0, 0.42, 0.06, 1),
    'floor': (0.09, 0.10, 0.12, 1),
    'prop': (0.28, 0.30, 0.36, 1),
    'rope': (0.85, 0.88, 0.95, 1),
}


def V(p):
    """Repère de l'export (x devant, y haut, z droite) -> Blender (X devant, Z haut, -Y droite)."""
    return Vector((p[0] * CM, -p[2] * CM, p[1] * CM))


def material(name):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m.diffuse_color = COL[name]
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = COL[name]
    bsdf.inputs['Roughness'].default_value = 0.35 if name == 'kb' else 0.6
    return m


def new_obj(kind, mat, **kw):
    if kind == 'cyl':
        bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=1, depth=2, **kw)
    elif kind == 'sphere':
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=14, radius=1, **kw)
    elif kind == 'cube':
        bpy.ops.mesh.primitive_cube_add(size=2, **kw)
    elif kind == 'torus':
        bpy.ops.mesh.primitive_torus_add(major_radius=1, minor_radius=0.22, major_segments=24, minor_segments=8, **kw)
    o = bpy.context.active_object
    o.data.materials.append(material(mat))
    bpy.ops.object.shade_smooth()
    return o


class Capsule:
    """Segment de membre : un cylindre + deux sphères aux extrémités."""

    def __init__(self, r, mat, caps=True):
        self.r = r
        self.cyl = new_obj('cyl', mat)
        self.caps = [new_obj('sphere', mat), new_obj('sphere', mat)] if caps else []

    def place(self, a, b):
        a, b = V(a), V(b)
        d = b - a
        ln = max(d.length, 1e-4)
        self.cyl.location = (a + b) / 2
        self.cyl.rotation_mode = 'QUATERNION'
        self.cyl.rotation_quaternion = d.to_track_quat('Z', 'Y')
        self.cyl.scale = (self.r * CM, self.r * CM, ln / 2)
        for c, p in zip(self.caps, (a, b)):
            c.location = p
            c.scale = (self.r * CM,) * 3


class Ball:
    def __init__(self, r, mat, squash=(1, 1, 1)):
        self.r = r
        self.o = new_obj('sphere', mat)
        self.squash = squash

    def place(self, p):
        self.o.location = V(p)
        self.o.scale = tuple(self.r * CM * s for s in self.squash)


def setup_scene(data):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.resolution_x, sc.render.resolution_y = RES
    sc.render.resolution_percentage = 100
    sc.render.use_persistent_data = True
    # Rendu Cycles (lumière réaliste, ombres douces)
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 8
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 3
    sc.cycles.diffuse_bounces = 2
    sc.cycles.glossy_bounces = 1
    sc.cycles.transmission_bounces = 0
    sc.cycles.transparent_max_bounces = 0
    sc.view_settings.view_transform = 'Standard'
    world = bpy.data.worlds.new('w')
    sc.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes['Background']
    bg.inputs[0].default_value = (0.035, 0.038, 0.05, 1)
    bg.inputs[1].default_value = 1.0
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN'))
    sc.collection.objects.link(sun)
    sun.data.energy = 3.2
    sun.data.angle = 0.25
    sun.rotation_euler = (0.65, 0.15, 0.95)
    fill = bpy.data.objects.new('fill', bpy.data.lights.new('fill', 'AREA'))
    sc.collection.objects.link(fill)
    fill.data.energy = 280
    fill.data.size = 3
    fill.location = (3, -3, 2.5)
    fill.rotation_mode = 'QUATERNION'
    fill.rotation_quaternion = (Vector((0, 0, 0.8)) - fill.location).to_track_quat('-Z', 'Y')
    rim = bpy.data.objects.new('rim', bpy.data.lights.new('rim', 'AREA'))
    sc.collection.objects.link(rim)
    rim.data.energy = 160
    rim.data.size = 2
    rim.location = (-2.5, 2.5, 2.2)
    rim.rotation_mode = 'QUATERNION'
    rim.rotation_quaternion = (Vector((0, 0, 1)) - rim.location).to_track_quat('-Z', 'Y')

    # Sol
    floor = new_obj('cube', 'floor', location=(0, 0, -0.01))
    floor.scale = (60, 60, 0.01)

    # Décor
    for pr in data['props']:
        if pr['type'] == 'wall':
            w = new_obj('cube', 'prop')
            w.location = V([pr['x'] + 4, 110, 0])
            w.scale = (0.04, 0.45, 1.1)
        if pr['type'] == 'box':
            b = new_obj('cube', 'prop')
            b.location = V([pr['x'] + pr['w'] / 2, pr['h'] / 2, 0])
            b.scale = (pr['w'] / 2 * CM, 0.35, pr['h'] / 2 * CM)

    # Caméra orthographique de trois quarts
    cam_cfg = data.get('cam') or {}
    az = math.radians(cam_cfg.get('az', 38))   # 0 = vue de profil, 90 = vue de face
    el = math.radians(cam_cfg.get('el', 12))
    cx, cy = data['view']
    target = V([cx, cy, 0])
    direction = Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    sc.collection.objects.link(cam)
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = 2.6 / data['zoom'] * cam_cfg.get('scale', 1.12)
    cam.location = target + direction * 6
    cam.rotation_mode = 'QUATERNION'
    cam.rotation_quaternion = (target - cam.location).to_track_quat('-Z', 'Y')
    cam.data.clip_end = 50
    sc.camera = cam
    return sc


def build_body(has_kb, has_rope):
    b = {}
    b['torso'] = Capsule(12, 'torso')
    b['shoulders'] = Capsule(6.5, 'torso')
    b['pelvisBar'] = Capsule(9, 'pelvis')
    b['neck'] = Capsule(4.5, 'skin', caps=False)
    b['head'] = Ball(10.5, 'skin', squash=(1, 0.95, 1.1))
    b['hair'] = Ball(10.8, 'hair', squash=(1, 0.96, 0.85))
    b['nose'] = Ball(2.6, 'skin')
    for side, mat in (('R', 'right'), ('L', 'left')):
        b['thigh' + side] = Capsule(7.5, mat)
        b['shin' + side] = Capsule(5.8, mat)
        b['foot' + side] = Capsule(4.2, mat)
        b['upper' + side] = Capsule(5.2, mat)
        b['fore' + side] = Capsule(4.4, mat)
        b['hand' + side] = Ball(4.6, 'skin')
    if has_kb:
        b['kb'] = Ball(9.5, 'kb', squash=(1, 1, 0.95))
        b['kbHandle'] = new_obj('torus', 'kb')
    if has_rope:
        b['rope'] = [Capsule(0.9, 'rope', caps=False) for _ in range(24)]
    return b


def pose_body(b, f):
    mid = lambda a, c, k=0.5: [a[i] + (c[i] - a[i]) * k for i in range(3)]
    b['torso'].place(mid(f['pelvis'], f['chest'], 0.08), mid(f['pelvis'], f['chest'], 0.92))
    b['shoulders'].place(f['shL'], f['shR'])
    b['pelvisBar'].place(f['hipL'], f['hipR'])
    b['neck'].place(f['chest'], f['neck'])
    b['head'].place(f['head'])
    # Cheveux : légèrement en arrière et au-dessus du visage
    d = math.radians(f['faceDir'])
    up = [math.sin(d), math.cos(d)]
    fwd = [math.cos(d), -math.sin(d)]
    h = f['head']
    b['hair'].place([h[0] + up[0] * 2.5 - fwd[0] * 2, h[1] + up[1] * 2.5 - fwd[1] * 2, h[2]])
    b['hair'].o.rotation_euler = (0, -d, 0)
    b['nose'].place([h[0] + fwd[0] * 10, h[1] + fwd[1] * 10, h[2]])
    for side, hip, sh in (('R', 'hipR', 'shR'), ('L', 'hipL', 'shL')):
        b['thigh' + side].place(f[hip], f['knee' + side])
        b['shin' + side].place(f['knee' + side], f['ankle' + side])
        b['foot' + side].place(f['ankle' + side], f['toe' + side])
        b['upper' + side].place(f[sh], f['elbow' + side])
        b['fore' + side].place(f['elbow' + side], f['hand' + side])
        b['hand' + side].place(f['hand' + side])
    if 'kb' in b and f.get('kb'):
        b['kb'].place(f['kb'])
        c = V(f['kb'])
        hand = V(f['kbHand']) if f.get('kbHand') else c + Vector((0, 0, 0.12))
        d3 = (hand - c)
        if d3.length < 1e-4:
            d3 = Vector((0, 0, 1))
        d3.normalize()
        hd = b['kbHandle']
        hd.location = c + d3 * 0.095
        hd.rotation_mode = 'QUATERNION'
        # Anse dans le plan qui contient l'axe main-cloche, perpendiculaire au côté
        q = d3.to_track_quat('Y', 'Z')
        hd.rotation_quaternion = q
        hd.scale = (0.055, 0.055, 0.055)
    if 'rope' in b and f.get('rope'):
        pts = f['rope']
        for i, seg in enumerate(b['rope']):
            seg.place(pts[i], pts[i + 1])


def render(ids=None, test=False):
    data = json.load(open(FRAMES))
    for ex_id, d in data.items():
        if ids and ex_id not in ids:
            continue
        sc = setup_scene(d)
        frames = d['frames']
        b = build_body(any(fr.get('kb') for fr in frames), any(fr.get('rope') for fr in frames))
        os.makedirs(f'{OUT}/{ex_id}', exist_ok=True)
        todo = list(enumerate(frames))
        if test:
            todo = [(k, frames[k]) for k in sorted({0, len(frames) * 2 // 5, len(frames) * 7 // 10})]
        for i, fr in todo:
            pose_body(b, fr)
            if 'kb' in b and not fr.get('kb'):
                b['kb'].o.hide_render = True
                b['kbHandle'].hide_render = True
            sc.render.filepath = f'{OUT}/{ex_id}/f{i:04d}.png'
            bpy.ops.render.render(write_still=True)
        print('RENDU', ex_id, len(frames), 'images', flush=True)


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    render(args[0].split(',') if args else None, test='--test' in sys.argv)
