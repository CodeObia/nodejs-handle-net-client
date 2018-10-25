export declare class Handle {
    constructor(ServerURL: string, userPrefix: string, keyPath: string, log: boolean = false)
    deleteHandle(id: string): Promise<any>
    newHandle(url: string): Promise<any>
    listHandles(): Promise<any>
}


export default Handle;