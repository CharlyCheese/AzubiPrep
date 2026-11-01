import test from 'node:test';
import assert from 'node:assert/strict';
import {selectTopics} from '../model.js';
const items=[{id:'1',title:'CSS-Layout',category:'Web'}];
test('leer',()=>assert.deepEqual(selectTopics([],'','all'),[]));
test('normalisiert',()=>assert.deepEqual(selectTopics(items,' CSS ','all'),items));
test('Kategorie',()=>assert.deepEqual(selectTopics(items,'css','Netzwerk'),[]));
test('keine Mutation',()=>{const before=JSON.stringify(items);selectTopics(items,'','all');assert.equal(JSON.stringify(items),before);});
