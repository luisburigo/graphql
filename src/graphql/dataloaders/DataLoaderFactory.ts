import * as DataLoader from 'dataloader'

import {DBConnection} from "../../interfaces/DBConnectionInterface";
import {DataLoaders} from "../../interfaces/DataLoadersInterface";
import {UserInstance} from "../../models/UserModel";
import {UserLoader} from "./UserLoader";
import {PostInstance} from "../../models/PostModel";
import {PostLoader} from "./PostLoader";
import {RequestedFields} from "../ast/RequestedFields";
import {DataLoaderParam} from "../../interfaces/DataLoaderParamInterface";

export class DataLoaderFactory {

    constructor(
        private db: DBConnection,
        private requestedFields: RequestedFields
    ) {
    }

    getLoaders(): DataLoaders {
        return {
            userLoader: new DataLoader<DataLoaderParam<number>, UserInstance>(
                (params: DataLoaderParam<number>[]) => UserLoader.batchUser(this.db.User, params, this.requestedFields),
                {cacheKeyFn: (param: DataLoaderParam<number[]>) => param.key}
            ),
            postLoader: new DataLoader<DataLoaderParam<number>, PostInstance>(
                (params: DataLoaderParam<number>[]) => PostLoader.bathPosts(this.db.Post, params, this.requestedFields),
                {cacheKeyFn: (param: DataLoaderParam<number[]>) => param.key}
            ),
        }
    }
}
