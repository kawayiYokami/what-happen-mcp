import axios, {AxiosResponse} from "axios";
import dayjs from "dayjs";
import {NewsItem} from "../types/index.js";
import {V2exRes} from "../types/shared.js";

const V2EX_API = process.env.V2EX_API || "https://www.v2ex.com/feed";
export const v2exShare = async () => {
    const res = await Promise.all(["create", "ideas", "programmer", "share"]
        .map(k => axios.get(`${V2EX_API}/${k}.json`) as Promise<AxiosResponse<V2exRes>>))
    return res.map(k => k.data.items).flat().map(k => ({
        id: k.id,
        title: k.title,
        extra: {
            date: dayjs.tz(k.date_modified ?? k.date_published, "Asia/Shanghai").valueOf(),
        },
        url: k.url,
    } as NewsItem)).sort((m, n) => m.extra?.date!! < n.extra?.date!! ? 1 : -1)
}
