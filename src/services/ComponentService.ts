import type { GameObjects } from 'phaser';

// Index for objects created
let object_id_index = 0;

export type Constructor<T extends {} = {}> = new (...args: any[]) => T;

export interface Component {

    init(go: Phaser.GameObjects.GameObject) : void;
    awake?: () => void;
    start?: () => void;
    update?: (dt: number, t: number) => void;
    destroy?: () => void;
}

export type GameObject = Phaser.GameObjects.GameObject & {
    id: number;
    name: string;
    dir: Phaser.Math.Vector2;
    speed: number;
};

export class ComponentService {


    private componentsByGameObject = new Map<number, Component[]>();
    private queuedForStart: Component[] = [];

    addComponent(go: Phaser.GameObjects.GameObject & GameObject, component: Component) {

        if(!go.id) {
            go.id = ++object_id_index;
        }

        if(!this.componentsByGameObject.has(go.id)) {
            this.componentsByGameObject.set(go.id, []);
        }

        const list = this.componentsByGameObject.get(go.id) as Component[];
        list.push(component);

        component.init(go);

        if(component.awake) {
            component.awake();
        }

        if(component.start) {
            this.queuedForStart.push(component);
        }
    }


    findComponent<ComponentType>(go: Phaser.GameObjects.GameObject & GameObject, componentType: Constructor<ComponentType>) {

        const components = this.componentsByGameObject.get(go.id);

        if(!components) {
            return null;
        }

        return components.find(component => component instanceof componentType);
    }

    destroyComponent<ComponentType>(go: GameObject, componentType: Constructor<ComponentType>): void {

        const componentsToDestory = this.findComponent(go, componentType)

        if(!componentsToDestory) {
            return null;
        }

        if(componentsToDestory.destroy) {
            componentsToDestory.destroy();
        }

        //find the index of the component to remove from go
        const i = this.componentsByGameObject.get(go.id)?.findIndex(c => c instanceof componentType);

        //if we found an index, remove it
        if(i != null) {
            this.componentsByGameObject.get(go.id)?.splice(i, 1);
        }
    }

    destroy(): void {
        const entries = this.componentsByGameObject.entries();

        for(const [,components] of entries) {
            components.forEach(component => {

                if(component.destroy) {
                    component.destroy();
                }
            })
        }

        //create new eempty map
        this.componentsByGameObject = new Map<number, Component[]>();
    }

    update(dt: number, t: number): void {

        while(this.queuedForStart.length > 0) {
            const component = this.queuedForStart.shift();

            if(component?.start) {
                component.start();
            }
        }

        const entries = this.componentsByGameObject.entries();

        //TODO create update list
        for(const [,components] of entries) {
            components.forEach(component => {

                if(component.update) {
                    component.update(dt, t);
                }
            })
        }
    }
}
