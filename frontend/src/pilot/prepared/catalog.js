import ch18 from './ch18.js';
import ch19 from './ch19.js';
import ch20 from './ch20.js';
import ch21 from './ch21.js';
import ch22 from './ch22.js';
import ch23 from './ch23.js';
import ch24 from './ch24.js';
import ch25 from './ch25.js';
import ch26 from './ch26.js';
import ch27 from './ch27.js';
import ch28 from './ch28.js';
import ch29 from './ch29.js';
import ch30 from './ch30.js';
import ch31 from './ch31.js';

export const PREPARED_CHAPTERS = [ch18, ch19, ch20, ch21, ch22, ch23, ch24, ch25, ch26, ch27, ch28, ch29, ch30, ch31];
export const PREPARED_LESSONS = PREPARED_CHAPTERS.flatMap(item => item.lessons);
