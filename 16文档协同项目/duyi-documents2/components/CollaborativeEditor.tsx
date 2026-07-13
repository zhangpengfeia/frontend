"use client";
import type { UserInfo } from "@/types";

import { useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import * as Y from "yjs";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { yCollab } from "y-codemirror.next";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

import { CustomSocketProvider } from "@/tools/CustomSocketProvider";

export default function CollaborativeEditor() {
  const { docId: roomName } = useParams(); // 获取路由参数中的文档 ID，作为房间号
  const editorRef = useRef<HTMLDivElement>(null); // 该 ref 用于获取编辑器的 DOM 元素
  const viewRef = useRef<EditorView | null>(null); // 该 ref 用于存储 CodeMirror 的 EditorView 实例

  const [markdownText, setMarkdownText] = useState<string>(""); // 用于存储 Markdown 文本

  const providerRef = useRef<CustomSocketProvider | null>(null); // 该 ref 用于存储 CustomSocketProvider 实例

  const [collaborators, setCollaborators] = useState<UserInfo[]>([]); // 用于存储协作者列表
  const [collaboratorName, setCollaboratorName] = useState<string>(""); // 用于存储新增协作者名称，用于和input的value绑定

  // websocket 连接地址
  const WEBSOCKET_URL =
    process.env.NEXT_WEBSOCKET_URL || "http://localhost:1234";

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // 该函数用于获取协作者列表
  async function fetchCollaborators() {
    try {
      const res = await fetch(`/api/doc/collaborators/${roomName}`);
      const result = await res.json();

      if (result.code === 0 && result.data) {
        setCollaborators(result.data); // 设置协作者列表
      }
    } catch {
      alert("获取协作者列表失败，请稍后再试");
    }
  }

  // 该 useEffect 主要就是用于初始化协同编辑器
  useEffect(() => {
    // 先做一个边界判断
    if (!editorRef.current || viewRef.current || typeof roomName !== "string")
      return;

    // 代码来到这里，说明没有问题，可以开始初始化编辑器了
    const initEditor = async () => {
      try {
        const ydoc = new Y.Doc(); // 创建一个新的 Yjs 文档
        const ytext = ydoc.getText("codemirror"); // 创建一个文本类型的共享副本

        const provider = new CustomSocketProvider(
          `${WEBSOCKET_URL}`,
          roomName,
          ydoc,
        );

        providerRef.current = provider; // 将 provider 存入 ref 中

        // 接下来定义一个更新方法
        // 该更新方法用于从 yjs 共享文档中更新 markdown 编辑器的内容
        const updatePreview = () => setMarkdownText(ytext.toString());

        // 监听 ytext 的变化，只要共享文本数据发生了变化，会触发此事件
        // 然后就会更新编辑器显示的内容
        ytext.observe(updatePreview);

        // 创建一个新的 CodeMirror 编辑器实例，并且进行相应的配置
        viewRef.current = new EditorView({
          // extensions 里面是各种扩展配置
          extensions: [
            basicSetup, // 基本设置，包括常用的功能，例如语法高亮、键盘快捷键、代码缩进
            markdown(), // Markdown 语言支持
            yCollab(ytext, provider.awareness), // 连接 Yjs 文档和 CodeMirror 编辑器
            EditorView.lineWrapping, // 自动换行
            EditorView.theme({
              // 设置编辑器的背景颜色和字体颜色
              "&": {
                backgroundColor: "white", // 设置背景颜色为白色
                color: "black", // 设置文本颜色为黑色
              },
              // 设置代码内容区域的样式
              ".cm-content": {
                fontSize: "16px", // 设置字体大小为16px
                padding: "16px", // 设置内容区域的内边距为16px
              },
              // 设置编辑器滚动区域的样式
              ".cm-scroller": {
                overflow: "auto", // 允许滚动，防止内容溢出
              },
            }), // 配置编辑器相关的主题
          ],
          // 设置父元素，将实例化出来的编辑器挂载到 DOM 上
          parent: editorRef.current!,
        });
      } catch {
        alert("初始化编辑器失败，请稍后再试");
      }
    };

    // 调用初始化编辑器的方法
    initEditor();

    return () => {
      // 组件卸载的时候，做一些清理相关的操作
      if (viewRef.current) {
        viewRef.current.destroy(); // 销毁 CodeMirror 实例
        viewRef.current = null; // 清空 ref
      }
      if (providerRef.current) {
        providerRef.current.destory(roomName); // 销毁 CustomSocketProvider 实例
        providerRef.current = null; // 清空 ref
      }
    };
  }, [roomName]);

  // 获取协作者列表
  useEffect(() => {
    if (typeof roomName !== "string") return;

    fetchCollaborators(); // 调用获取协作者列表的方法
  }, [roomName]);

  // 保存文档
  const saveDocHandler = async () => {
    try {
      if (!viewRef.current) return;

      // 获取编辑器中的内容
      const content = viewRef.current.state.doc.toString();

      // 发送请求保存文档
      const res = await fetch("/api/doc/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          docId: roomName,
          content,
        }),
      });

      const result = await res.json();

      if (result.code === 0) {
        alert("文本保存成功");
      } else {
        alert(result.msg || "文本保存失败");
      }
    } catch {
      alert("网络异常，请稍后再试");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Button
          className="mr-3"
          color="primary"
          size="sm"
          onPress={saveDocHandler}
        >
          保存文档
        </Button>
        <Button color="danger" size="sm" onPress={onOpen}>
          添加协作者
        </Button>
      </div>
      <div className="mb-4">
        <span className="text-sm text-gray-500 mb-4">该文档协作者：</span>
        <div className="flex gap-2 items-center mt-2">
          {collaborators.length === 0 && (
            <span className="text-sm text-gray-400">暂无协作者</span>
          )}
          {collaborators.map((user) => (
            <Avatar
              key={user.username}
              radius="full"
              size="sm"
              src={user.avatar || "/avatar.gif"}
              title={user.username}
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col h-full bg-white border rounded shadow-sm">
          <h2 className="text-lg font-semibold p-4 border-b">编辑区</h2>
          {/* 编辑器 */}
          <div ref={editorRef} className="flex-1 overflow-auto px-4 pb-4" />
        </div>
        <div className="flex flex-col h-full bg-white border rounded shadow-sm">
          <h2 className="text-lg font-semibold p-4 border-b">预览区</h2>
          <div className="prose prose-sm max-w-none flex-1 overflow-auto p-4">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
              {markdownText}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      {/* 模态框：用于添加协作者 */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>添加协作者</ModalHeader>
              <ModalBody>
                <Input
                  label="协作者用户名"
                  placeholder="请输入协作者用户名"
                  value={collaboratorName}
                  onChange={(e) => setCollaboratorName(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  取消
                </Button>
                <Button
                  color="primary"
                  onPress={async () => {
                    try {
                      const res = await fetch(`/api/doc/addCollaborator`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          docId: roomName,
                          username: collaboratorName,
                        }),
                      });

                      const result = await res.json();

                      if (result.code === 0) {
                        alert("添加协作者成功");
                        fetchCollaborators(); // 重新获取协作者列表
                        setCollaboratorName(""); // 清空输入框
                        onClose(); // 关闭模态框
                      } else {
                        alert(result.msg || "添加协作者失败");
                      }
                    } catch {
                      alert("网络异常，请稍后再试");
                    }
                  }}
                >
                  确认添加
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
