export abstract class Data {
    static id = 0;

    public static sameInstance(instanceId: number): boolean {
        return Data.id === instanceId;
    }

    public static getId(): number {
        return Data.id;
    }

    public static getNextId(): number {
        return ++Data.id;
    }
}
