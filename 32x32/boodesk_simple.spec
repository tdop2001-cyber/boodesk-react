# -*- mode: python ; coding: utf-8 -*-

import os
import sys
import site

block_cipher = None

# Encontrar o caminho do ttkthemes de forma mais robusta
ttkthemes_path = None
for site_path in site.getsitepackages():
    ttkthemes_candidate = os.path.join(site_path, 'ttkthemes')
    if os.path.exists(ttkthemes_candidate):
        ttkthemes_path = ttkthemes_candidate
        break

# Se não encontrou nos site-packages, tentar no usuário
if not ttkthemes_path:
    for site_path in site.getusersitepackages():
        ttkthemes_candidate = os.path.join(site_path, 'ttkthemes')
        if os.path.exists(ttkthemes_candidate):
            ttkthemes_path = ttkthemes_candidate
            break

# Preparar dados do ttkthemes se encontrado
ttkthemes_datas = []
if ttkthemes_path:
    # Incluir todo o diretório ttkthemes
    ttkthemes_datas.append((ttkthemes_path, 'ttkthemes'))

a = Analysis(
    ['app23a.py'],
    pathex=[],
    binaries=[],
    datas=ttkthemes_datas,  # Incluir dados do ttkthemes
    hiddenimports=[
        'ttkthemes',
        'ttkthemes.themed_tk',
        'ttkthemes.themed_style',
        'ttkthemes.themed_toplevel',
        'ttkthemes.themed_ttk',
        'ttkthemes.themed_frame',
        'ttkthemes.themed_button',
        'ttkthemes.themed_label',
        'ttkthemes.themed_entry',
        'ttkthemes.themed_combobox',
        'ttkthemes.themed_treeview',
        'ttkthemes.themed_notebook',
        'ttkthemes.themed_progressbar',
        'ttkthemes.themed_scale',
        'ttkthemes.themed_spinbox',
        'ttkthemes.themed_checkbutton',
        'ttkthemes.themed_radiobutton',
        'ttkthemes.themed_menu',
        'ttkthemes.themed_toolbar',
        'ttkthemes.themed_statusbar',
        'ttkthemes.themed_dialog',
        'ttkthemes.themed_messagebox',
        'ttkthemes.themed_filedialog',
        'ttkthemes.themed_colorchooser',
        'ttkthemes.themed_fontchooser',
        'ttkthemes.themed_printdialog',
        'ttkthemes.themed_printpreview',
        'ttkthemes.themed_printsetup',
        'ttkthemes.themed_print',
        'PIL',
        'PIL._tkinter_finder',
        'PIL.Image',
        'PIL.ImageTk',
        'matplotlib',
        'matplotlib.backends.backend_tkagg',
        'matplotlib.backends.backend_tkagg_figure',
        'matplotlib.backends.backend_tkagg_canvas',
        'matplotlib.backends.backend_tkagg_renderer',
        'matplotlib.backends.backend_tkagg_toolbar',
        'matplotlib.backends.backend_tkagg_navigation_toolbar2',
        'matplotlib.backends.backend_tkagg_toolbar2',
        'matplotlib.backends.backend_tkagg_toolbar2_toolbar',
        'matplotlib.backends.backend_tkagg_toolbar2_navigation_toolbar2',
        'tkcalendar',
        'tkcalendar.calendar',
        'tkcalendar.dateentry',
        'psutil',
        'pandas',
        'numpy',
        'psycopg2',
        'psycopg2.extensions',
        'psycopg2.extras',
        'tkinter',
        'tkinter.ttk',
        'tkinter.messagebox',
        'tkinter.filedialog',
        'tkinter.colorchooser',
        'tkinter.font',
        'tkinter.scrolledtext',
        'tkinter.tix',
        'tkinter.constants',
        'tkinter.commondialog',
        'tkinter.dialog',
        'tkinter.simpledialog',
        'tkinter.tkinter',
        'tkinter.tkinter_colorchooser',
        'tkinter.tkinter_common_dialog',
        'tkinter.tkinter_constants',
        'tkinter.tkinter_dialog',
        'tkinter.tkinter_dnd',
        'tkinter.tkinter_filedialog',
        'tkinter.tkinter_font',
        'tkinter.tkinter_image',
        'tkinter.tkinter_messagebox',
        'tkinter.tkinter_scrolledtext',
        'tkinter.tkinter_simpledialog',
        'tkinter.tkinter_tix',
        'tkinter.tkinter_ttk',
        'tkinter.tkinter_widgets',
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
    version_file='version_info.txt' if os.path.exists('version_info.txt') else None,
    icon='icons/icon.ico' if os.path.exists('icons/icon.ico') else None,
)
