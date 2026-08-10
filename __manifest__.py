{
    'name': "Mobile Menu Drilldown Style",
    'version': '19.0.1.0.0',
    'category': 'Website/Website',
    'summary': "Full-screen mobile menu: big rows, separators, chevrons",
    'author': "Anis Alim",
    'depends': ['website_sale'],
    'data': [
        'views/s_mega_menu_multi_menus.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'website_mobile_menu_drilldown/static/src/scss/mobile_menu.scss',
            'website_mobile_menu_drilldown/static/src/js/mega_menu_drilldown.js',
        ],
    },
    'license': 'LGPL-3',
}
