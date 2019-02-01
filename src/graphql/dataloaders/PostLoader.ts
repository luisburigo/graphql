import {PostInstance, PostModel} from "../../models/PostModel";

export class PostLoader {

    static bathPosts(Post: PostModel, ids: number[]): Promise<PostInstance[]>{
        return Promise.resolve(
            Post.findAll({
                where: {id: {$in: ids}}
            })
        )
    }

}
