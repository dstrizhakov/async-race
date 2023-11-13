import { BaseObject, IApi, Page } from './types';
import { mapToURLParams } from './utils/paramsHelper';

export class Api implements IApi {
    public baseUrl: string;

    constructor(baseUrl: string = 'http://127.0.0.1:3000/') {
        this.baseUrl = baseUrl;
    }

    public errorHandler(res: Response): Response {
        if (!res.ok) {
            console.warn('Эта ошибка обработана при запросе API:', res.status, res.statusText);
            return res;
        }
        return res;
    }

    public getPage<T>(url: string, params?: BaseObject): Promise<Page<T>> {
        const query = new URL(url, this.baseUrl);

        if (params) {
            query.search = new URLSearchParams(mapToURLParams(params, true)).toString();
        }

        return this.send(query, 'GET').then((res: Response) =>
            res.json().then((items: T[]) => {
                const total = res.headers.get('X-Total-Count');
                return {
                    items,
                    total: Number(total) || 0,
                };
            })
        );
    }

    public send(url: URL, method: string, data?: BaseObject): Promise<Response> {
        return fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            method,
            body: JSON.stringify(data) || null,
        }).then((res: Response) => this.errorHandler(res));
    }

    public get<T>(url: string, params?: BaseObject): Promise<T> {
        const query = new URL(url, this.baseUrl);

        if (params) {
            query.search = new URLSearchParams(mapToURLParams(params)).toString();
        }

        return this.send(query, 'GET').then((res: Response) => res.json());
    }

    public post<T>(url: string, data: BaseObject): Promise<T> {
        return this.send(new URL(url, this.baseUrl), 'POST', data).then((res: Response) => res.json());
    }

    public put<T>(url: string, data: BaseObject): Promise<T> {
        return this.send(new URL(url, this.baseUrl), 'PUT', data).then((res: Response) => res.json());
    }

    public patch<T>(url: string, params?: BaseObject): Promise<T> {
        const query = new URL(url, this.baseUrl);

        if (params) {
            query.search = new URLSearchParams(mapToURLParams(params)).toString();
        }

        return this.send(query, 'PATCH').then((res: Response) => res.json());
    }

    public delete<T>(url: string, id: number): Promise<T> {
        return this.send(new URL(`${url}/${id}`, this.baseUrl), 'DELETE').then((res: Response) => res.json());
    }
}
