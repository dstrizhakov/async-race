import { Garage } from './Garage';
import { Score } from './Score';
import { Api } from './Api';
import { IApp, IGarage, IHtml, IScore, RaceEvent } from './types';
import { EventEmitter } from './EventEmitter';

export class App implements IApp {
    public garage: IGarage;

    public score: IScore;

    public api: Api;

    public eventEmitter: EventEmitter<RaceEvent>;

    public root: HTMLElement;

    public html: IHtml;

    public currentPage: 'race' | 'winners';

    constructor(api: Api, html: IHtml) {
        this.garage = new Garage(this);
        this.score = new Score(this);
        this.api = api;
        this.eventEmitter = new EventEmitter<RaceEvent>();
        this.root = document.getElementById('root') as HTMLElement;
        this.html = html;
        this.currentPage = 'race';
    }

    public init() {
        this.initMain();
        this.initHeader();
        this.initFooter();
    }

    private initHeader() {
        const header = document.createElement('header');
        header.innerHTML = this.html.header;
        header.classList.add('header');
        this.root.prepend(header);

        let storedPage = localStorage.getItem('page');
        const headerTabs = document.querySelectorAll('.header__tablinks');
        if (typeof storedPage !== typeof this.currentPage) {
            storedPage = 'race';
            localStorage.setItem('page', 'race');
        }

        this.goToPage(storedPage as typeof this.currentPage);
        headerTabs.forEach((children) => {
            const tabPage = children.innerHTML.toLowerCase();
            children.classList.remove('active');
            if (tabPage === storedPage) {
                children.classList.add('active');
            }
        });

        // init listeners
        header.addEventListener('click', (event: MouseEvent) => {
            const { target } = event;
            if (target instanceof Element && target.classList.contains('header__tablinks')) {
                headerTabs.forEach((children) => children.classList.remove('active'));
                target.classList.add('active');
                const targetText = target.innerHTML.toLowerCase();
                this.goToPage(targetText as typeof this.currentPage);
            }
        });
    }

    private initMain() {
        const main = document.createElement('main');
        main.classList.add('main');
        this.root.append(main);
    }

    private initFooter() {
        const footer = document.createElement('footer');
        footer.classList.add('footer');
        footer.innerHTML = this.html.footer;
        this.root.append(footer);
    }

    private goToPage(page: typeof this.currentPage) {
        localStorage.setItem('page', page);
        switch (page) {
            case 'race':
                this.garage.render();
                break;
            case 'winners':
                this.score.render();
                break;
            default:
                console.warn(`Page "${page}" is undefined. Select correct page.`);
        }
    }
}
