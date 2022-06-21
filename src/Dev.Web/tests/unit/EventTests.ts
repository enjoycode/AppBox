import {Event} from "@/System";

class EventSource {
    public readonly ValueChanged = new Event<boolean>();

    public RaiseEvent(value: boolean) {
        this.ValueChanged.Invoke(value);
    }
}

class EventListener {
    private readonly _name: string;

    constructor(name: string) {
        this._name = name;
    }

    public OnValueChanged(value: boolean) {
        console.log(this._name + " OnValueChanged: " + value);
    }

    public static OnValueChangedStatic(value: boolean) {
        console.log("OnValueChanged Static: " + value);
    }
}

describe("Event tests", () => {

    it("Event test", () => {
        let source = new EventSource();

        // bind to instance method
        let listener1 = new EventListener("Listener1");
        source.ValueChanged.Add(listener1.OnValueChanged, listener1);
        let listener2 = new EventListener("Listener2");
        source.ValueChanged.Add(listener2.OnValueChanged, listener2);
        // bind to static method
        source.ValueChanged.Add(EventListener.OnValueChangedStatic);

        source.ValueChanged.Invoke(true);

        // remove
        source.ValueChanged.Remove(listener2.OnValueChanged, listener2);
        source.ValueChanged.Remove(EventListener.OnValueChangedStatic);

        console.log("=====After remove=====");

        source.ValueChanged.Invoke(false);

        // expect(sum).toEqual(6);
    });

});
