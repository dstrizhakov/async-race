import './index.html';
import './index.scss';
import { Api } from './modules/Api';
import { App } from './modules/App';
import { html } from './modules/data/html';

const api = new Api('http://127.0.0.1:3000/');
const race = new App(api, html);

race.init();

// document.addEventListener('DOMContentLoaded', function () {
//     alert(
//         'Уважаемый проверяющий, если не сложно проверьте, пожалуйста, мою работу в последний день. Времени не хватает, но очень хочется сделать это задание качественно. Спасибо!'
//     );
// });
