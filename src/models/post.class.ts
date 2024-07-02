export class Post {
    post_id: string;
    message: string;
    user_id: string;
    thread_id: string;
    date: number;

    constructor(obj?: any) {
        this.post_id = obj && obj.post_id ? obj.post_id : '';
        this.message = obj && obj.message ? obj.message : '';
        this.user_id = obj && obj.user_id ? obj.user_id : '';
        this.thread_id = obj && obj.thread_id ? obj.thread_id : '';
        this.date = obj && obj.date ? obj.date : -1;
    }

    toJson() {
        return {
            post_id: this.post_id,
            message: this.message,
            user_id: this.user_id,
            thread_id: this.thread_id,
            date: this.date
        };
    }
}