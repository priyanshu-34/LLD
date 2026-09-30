
//Used for Subscribe model kind of situations
export { };
interface User {
    update(channel: Channel): void
}
interface Channel {
    addSubscriber(user: User): void;
    removeSubscriber(user: User): void;
    notify(): void;
}

class MyChannel {
    id: number;
    private subscribers: User[] = [];

    constructor(id: number) {
        this.id = id;
    }

    addSubscriber(user: User) {
        this.subscribers.push(user);
        console.log("User added as subscriber")
    }
    removeSubscriber(user: User) {
        this.subscribers = this.subscribers.filter((s: User) => {
            return s != user;
        })
        return this.subscribers;
    }

    notify() {
        for (const subscriber of this.subscribers) {
            subscriber.update(this);
        }
    }
}

class User implements User{
    update(channel: Channel): void{
        console.log("Update Notification Recieved: ", channel)
    }
}

function client() {
    const myChannel = new MyChannel(2);
    const user1 = new User();
    const user2 = new User();

    myChannel.addSubscriber(user1)
    myChannel.addSubscriber(user2)

    myChannel.notify()
}

client()