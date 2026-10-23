"use strict";
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(ent=>ent.isDirectory()?walk(path.join(dir,ent.name)):ent.name.endsWith('.js')?[path.join(dir,ent.name)]:[])}
const files=['index.js',...walk(path.join(root,'server')),...walk(path.join(root,'public')),...walk(path.join(root,'tests'))].map(f=>path.isAbsolute(f)?f:path.join(root,f));
let fail=0;
for(const file of files){const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(check.status){fail++;console.error(path.relative(root,file)+': '+check.stderr)}}
console.log(`${files.length-fail}/${files.length} archivos JavaScript con sintaxis valida`);
process.exitCode=fail?1:0;
