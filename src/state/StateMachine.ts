export interface StateConfig {
    name?: string;
    onEnter?: (config?: any) => void;
    onUpdate?: (dt: number, ticker: number, config?: any) => void;
    onExit?: (config?: any) => void;
}

export class StateMachine {

    private context?: any;
    private name?: string;
    private ticker: number = 0;
    private config: any = {};
    private states = new Map<string, StateConfig>();
    private previousState?: StateConfig;
    currentState?: StateConfig;

    private isSwitchingState: boolean = false;
    private stateQueue: string[] = [];
    
    constructor(context?: any, name?: string) {
        this.context = context;
        this.name = name ?? 'fsm';
    }

    getPreviousState() {
        
        if(!this.previousState) {
            return '';
        }

        return this.previousState.name;
    }

    isCurrentState(name: string) {
     
        if(!this.currentState) {
            return false;
        }

        return this.currentState.name === name;
    }

    addState(name: string, config?: StateConfig) {

        this.states.set(name, {
            name,
            onEnter: config?.onEnter?.bind(this.context),
            onUpdate: config?.onUpdate?.bind(this.context),
            onExit: config?.onExit?.bind(this.context),
        });

        return this;
    }

    setState(name: string, config? : any) {

        if(!this.states.has(name)) {
            console.warn(`unable to set state=${name}`);
            return;
        }

        if(this.isSwitchingState) {

            this.stateQueue.push(name);
            return;
        }

        this.isSwitchingState = true;

        if(this.currentState?.onExit) {
            this.currentState.onExit(this.config);
        }

        this.previousState = this.currentState;
        this.currentState = this.states.get(name);
        this.config = config;

        if(this.currentState) {

            this.ticker = 0;

            if(this.currentState?.onEnter) {
                this.currentState.onEnter(this.config);
            }
        }

        this.isSwitchingState = false;
        return this;
    }

    update(dt: number) {

        if(this.stateQueue.length > 0) {
            const name = this.stateQueue.shift()!;
            this.setState(name);
            return;
        }

        if(this.currentState?.onUpdate) {
            this.currentState.onUpdate(dt, this.ticker++, this.config);
        }
    }

}