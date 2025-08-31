# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['..\\app23a.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=['ttkthemes', 'ttkthemes.themed_tk', 'ttkthemes.themed_style', 'ttkthemes.themed_toplevel', 'PIL', 'PIL._tkinter_finder', 'matplotlib', 'matplotlib.backends.backend_tkagg', 'tkcalendar', 'psutil', 'pandas', 'numpy', 'psycopg2', 'psycopg2.extensions', 'psycopg2.extras'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='Boodesk_ttkthemes_test',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
