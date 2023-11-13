import { IHtml } from '../types';

export const html: IHtml = {
    header: `<div class="header__tab">
                <button class="header__tablinks active">Race</button>
                <button class="header__tablinks">Winners</button>
            </div>
            <div class="header__logo">
                <div class="header__text">
                    <span style="--i: 1">A</span>
                    <span style="--i: 2">s</span>
                    <span style="--i: 3">y</span>
                    <span style="--i: 4">n</span>
                    <span style="--i: 5">c</span>
                    <span style="--i: 6">R</span>
                    <span style="--i: 7">a</span>
                    <span style="--i: 8">c</span>
                    <span style="--i: 9">e</span>
                </div>
            </div>`,
    footer: `<a href="https://github.com/dstrizhakov" target="_blank" class="footer__link">
                <img src="assets/github_logo.svg" alt="git" />
                <span>d.strizhakov</span>
                </a>
            <span>2023</span>
            <a href="https://rs.school/js/" target="_blank" class="footer__link">
                <img src="assets/rs_school_js.svg" alt="rsschool" />
            </a>`,
    race: `
    <div id="race-options" class="race__options options">
        <div class="options__wrapper option">
            <div class="option__create">
                <input id="create-name" class="option__input" type="text" />
                <input id="create-color" class="option__color create-color" type="color" />
                <button id="create-button" class="button button__create">Create</button>
            </div>
            <div class="option__update">
                <input id="update-name" class="option__input" type="text" />
                <input id="update-color" class="option__color" type="color" />
                <button id="update-button" class="button button__update">Update</button>
            </div>
            <div class="options__race">
                <button class="button button__race">Race</button>
                <button class="button button__reset">Reset</button>
                <button class="button button__generate">Generate cars</button>
            </div>
        </div>
    </div>
    <h2 class="race__heading">Garage: <span id='total-cars'></span>  cars</h2>
    <h3 class="race__winner">Last winner: <span id="race-winner"></span></h3>
    <div id="race-content" class="race__content"></div>
    <div class="race__pagination pagination">
        <button class="button pagination__prev">Prev</button>
        <span id="pagination-page" class="pagination__page">1</span>
        <button class="button pagination__next">Next</button>
    </div>`,
    winners: `
    <h2 class="winners__heading">Winners: <span id='total-winners'></span>  cars</h2>
    <div class="winners__content">
    <div class="winners__results">
    <table class="winners__table">
        <tbody id="winners-content">
            <tr>
                <th><span>Id</span> <button data-sort="id" class="button button__filter">&#8645;</button></th>
                <th>Car</th>
                <th>Name</th>
                <th><span>Wins</span> <button data-sort="wins" class="button button__filter">&#8645;</button></th>
                <th><span>Best time</span> <button data-sort="time" class="button button__filter">&#8645;</button></th>
                <th>Actions</th>
            </tr>
        </tbody>
    </table>
    </div>
    <div class="winners__pagination pagination">
    <button class="button pagination__prev-score">Prev</button>
    <span id="pagination-page-score" class="pagination__page">1</span>
    <button class="button pagination__next-score">Next</button>
    </div>
    </div>
    `,
};
