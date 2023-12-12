input_file = open('scripts/UserScript.norequire.js')
contents = input_file.read()

scripts = ['common.js', 'Chapter.js', 'ErrorMessage.js', 'Interface.js', 'Macro.js', 'Series.js', 'Template.js', 'Volume.js', 'Week.js', 'load file.js']
for script in scripts:
    script_file = open(f'scripts/{script}')
    script_contents = script_file.read()
    contents = contents.replace(f'%{script}%', script_contents)

styles = ['styles.css', 'grid.css']
for style in styles:
    style_file = open(f'styles/{style}')
    style_contents = style_file.read()
    contents = contents.replace(f'^{style}^', style_contents)

output_file = open('scripts/UserScript.js', 'w')
output_file.write(contents)

