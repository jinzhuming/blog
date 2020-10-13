// 批量给文章添加 title
var fs = require("fs");
var pathName = './source/_posts';
fs.readdir(pathName, function(err, files) {
    files.forEach(file => {
         fs.readFile(`${pathName}/${file}`, 'utf8', function(err, data ) {
             const splitFilename = file.split('.')
             const newFilename =splitFilename.filter((item, i) => item !== 'md' && item !=='mdx' && i !== splitFilename.length - 1 )
                 .join('.')

           fs.writeFile(`${pathName}/${file}`,`---
title: ${newFilename}
---

${data}
`, 'utf8',()=> {})
        })

    })
})
