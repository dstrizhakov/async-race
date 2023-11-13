import { Query, IApp, IScore, Winners, IWinner, Winner, Sort, Asc } from './types';
import winnerTemplate from './data/winnerTemplate';

export class Score implements IScore {
    public app: IApp;

    private page: number;

    private limit: number;

    private total: number;

    private sort: Sort;

    private asc: Asc;

    constructor(app: IApp) {
        this.app = app;
        this.page = 1;
        this.limit = 10;
        this.total = 1;
        this.sort = 'id';
        this.asc = 'ASC';
    }

    public render() {
        const main = document.querySelector('main') as HTMLElement;
        main.innerHTML = '';

        const winnersRoot = document.createElement('div');
        winnersRoot.classList.add('winners');
        winnersRoot.innerHTML = this.app.html.winners;
        main.append(winnersRoot);

        this.renderScorePage();
    }

    public renderScorePage(): void {
        const storedPage = Number(localStorage.getItem('winnersPage'));
        if (!Number.isNaN(storedPage) && storedPage !== null) {
            this.page = +storedPage;
        }
        this.getWinners({
            page: this.page,
            limit: this.limit,
            sort: this.sort,
            order: this.asc,
        }).then((winners: Winners) => {
            const totalWinners = document.getElementById('total-winners') as HTMLElement;
            totalWinners.innerText = winners.total.toString();
            this.total = winners.total;
            this.renderWinners(winners.items);
            document.body.addEventListener('click', this.listener);

            const sortButton = document.querySelector(`[data-sort="${this.sort}"]`) as HTMLButtonElement;
            if (this.asc === 'ASC') {
                sortButton.innerText = '⇑';
            } else {
                sortButton.innerText = '⇓';
            }

            const paginationSpan = document.getElementById('pagination-page-score') as HTMLElement;
            paginationSpan.innerText = `${this.page.toString()} / ${Math.ceil(this.total / this.limit)}`;
        });
    }

    public listener = (event: MouseEvent): void => {
        const target = event.target as HTMLElement;
        const id = Number(target.dataset.id);
        if (target.closest('.button__delete') && id) {
            this.deleteWinner(id);
        } else if (target.closest('.pagination__next-score') && Math.ceil(this.total / this.limit) > this.page) {
            this.page += 1;
            localStorage.setItem('winnersPage', this.page.toString());
            this.render();
        } else if (target.closest('.pagination__prev-score') && this.page > 1) {
            this.page -= 1;
            localStorage.setItem('winnersPage', this.page.toString());
            this.render();
        } else if (target.closest('.button__filter')) {
            const { sort } = target.dataset;
            if (sort === 'id' || sort === 'wins' || sort === 'time') {
                this.setSort(sort);
                this.render();
            }
        }
    };

    private setSort(sort: Sort) {
        this.sort = sort;
        const sortButton = document.querySelector(`[data-sort="${sort}"]`) as HTMLButtonElement;
        if (this.asc === 'ASC') {
            sortButton.innerText = '⇑';
            this.asc = 'DESC';
        } else {
            this.asc = 'ASC';
            sortButton.innerText = '⇓';
        }
    }

    public renderWinners(winners: IWinner[]): void {
        const winnersContent = document.getElementById('winners-content') as HTMLElement;
        // winnersContent.innerHTML = '';
        winners.forEach((winner: IWinner) => {
            const winnerElement = document.createElement('tr');
            const winnerCar = this.app.garage.cars.find((car) => car.id === winner.id);
            let color = '#123456';
            let name = 'Tesla';
            if (winnerCar) {
                color = winnerCar.color;
                name = winnerCar.name;
                const currentWinnerTemplate = winnerTemplate(color, name, winner.id, winner.wins, winner.time);
                winnerElement.innerHTML = currentWinnerTemplate;
                winnersContent.append(winnerElement);
            }
        });
    }

    public getWinners(params: Partial<Query>): Promise<Winners> {
        return this.app.api.getPage('winners', params);
    }

    public async addWinner(winner: Winner): Promise<Partial<Winner>> {
        try {
            const winnerFromApi: Winner = await this.app.api.get(`winners/${winner.id}`);
            if (Object.keys(winnerFromApi).length !== 0) {
                await this.app.api.put<Winner>(`winners/${winner.id}`, {
                    id: winner.id,
                    wins: winnerFromApi.wins + 1,
                    time: winner.time,
                });
            } else {
                await this.app.api.post<Winner>('winners', {
                    id: winner.id,
                    wins: 1,
                    time: winner.time,
                });
            }

            // Since the addWinner method is expected to return a Partial<Winner>,
            // you should return a Partial<Winner> here, even if it's not fully implemented.
            return winner;
        } catch (error) {
            console.warn('Error while adding/updating a winner:', error);
            return {};
        }
    }

    private async deleteWinner(id: number) {
        try {
            await this.app.api.delete('winners', id);
            await this.app.api.delete('garage', id);
            this.render();
        } catch (error) {
            console.warn('Error while deleting a winner:', error);
        }
    }
}
