const getRandomElement = (list: string[]): string => {
    return list[Math.floor(Math.random() * list.length)];
};

export default getRandomElement;
