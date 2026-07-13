import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Alert {
  color:
    | "success"
    | "default"
    | "primary"
    | "secondary"
    | "warning"
    | "danger"
    | undefined;
  title: string;
  isShow: boolean;
}

export interface UserInfo {
  username: string;
  avatar: string;
}

export interface DocItem {
  _id: string; // 文档ID
  title: string; // 文档标题
  desc: string; // 文档简介、描述
  content: string; // 文档内容
  createTime: string; // 创建时间
  updateTime: string; // 更新时间
  // 文档的创建者
  owner: {
    _id: string; // 创建者ID
    username: string; // 创建者名称
  };
  collaborators?: string[]; // 协作者列表，里面存放的是用户ID
}
