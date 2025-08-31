# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['app23a.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=[
        'ttkthemes',
        'ttkthemes.themed_tk',
        'ttkthemes.themed_style',
        'ttkthemes.themed_toplevel',
        'PIL',
        'PIL._tkinter_finder',
        'matplotlib',
        'matplotlib.backends.backend_tkagg',
        'tkcalendar',
        'psutil',
        'pandas',
        'numpy',
        'psycopg2',
        'psycopg2.extensions',
        'psycopg2.extras'
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='Boodesk',
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
    version_file='version_info.txt',
    icon='icons/icon.ico' if os.path.exists('icons/icon.ico') else None,
)
