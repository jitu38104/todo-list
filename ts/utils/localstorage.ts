export const getItem = async(key: string) => {
    const data: any = await window.localStorage.getItem(key);
    return JSON.parse(data);
}

export const setItem = (key:string, value:string) => {
    window.localStorage.setItem(key, value);
}