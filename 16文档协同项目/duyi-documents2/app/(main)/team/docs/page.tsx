"use client";
import type { DocItem } from "@/types";

import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { useRouter } from "next/navigation";

import { formatDate } from "@/tools/utils";

const DocsPage = () => {
  const router = useRouter();
  // 存储文档列表的状态
  const [docs, setDocs] = useState<DocItem[]>([]);
  // 存储新文档的标题和简介相关的状态
  const [docName, setDocName] = useState(""); // 文档标题
  const [docDesc, setDocDesc] = useState(""); // 文档简介

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    // 请求所有的文档列表
    const fetchDocs = async () => {
      try {
        const response = await fetch("/api/doc");
        const result = await response.json();

        if (response.ok && result.code === 0) {
          setDocs(result.data);
        } else {
          alert("获取文档列表失败");
        }
      } catch {
        alert("网络异常，获取文档列表失败");
      }
    };

    fetchDocs();
  }, []);

  // 新增文档
  const addNewDoc = async () => {
    try {
      const response = await fetch("/api/doc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          docName,
          docDesc,
          owner: localStorage.getItem("username"),
        }),
      });

      const result = await response.json();

      if (response.ok && result.code === 0) {
        // 跳转到文档编辑器
        router.push(`/editor/${result.data._id}`);
        // 关闭模态框
        onOpenChange();
        // 清空模态框里面的内容
        setDocName("");
        setDocDesc("");
      } else {
        alert(result.msg || "新增文档失败");
      }
    } catch {
      alert("网络异常，新增文档失败");
    }
  };

  // 修改文档按钮对应的事件处理函数
  const editBtnHandler = async (doc: DocItem) => {
    // 先从本地拿到用户名
    const username = localStorage.getItem("username");

    try {
      const response = await fetch(
        `/api/doc/checkAccess/${doc._id}?username=${username}`,
      );

      const result = await response.json();

      if (result.code === 0) {
        // 说明有权限，可以进行跳转
        router.push(`/editor/${doc._id}`);
      } else {
        alert(result.msg || "没有权限访问该文档");
      }
    } catch {
      alert("网络异常，获取文档权限失败");
    }
  };

  return (
    <div className="p-2 bg-white dark:bg-black">
      <Button
        aria-label="新增按钮"
        color="primary"
        radius="full"
        size="md"
        onPress={onOpen}
      >
        新增文档
      </Button>
      {/* 文档列表 */}
      <Table aria-label="文档列表" className="mt-6">
        <TableHeader>
          <TableColumn aria-label="文档名称">文档名称</TableColumn>
          <TableColumn aria-label="文档简介">文档简介</TableColumn>
          <TableColumn aria-label="创建时间">创建时间</TableColumn>
          <TableColumn aria-label="更新时间">更新时间</TableColumn>
          <TableColumn aria-label="创建者">创建者</TableColumn>
          <TableColumn aria-label="创建者">操作</TableColumn>
        </TableHeader>
        <TableBody emptyContent="暂无任何文档">
          {docs.map((doc) => (
            <TableRow key={doc._id}>
              <TableCell>{doc.title}</TableCell>
              <TableCell>
                {doc.desc.length > 10
                  ? doc.desc.slice(0, 10) + "..."
                  : doc.desc}
              </TableCell>
              <TableCell>{formatDate(doc.createTime)}</TableCell>
              <TableCell>{formatDate(doc.updateTime)}</TableCell>
              <TableCell>{doc.owner.username}</TableCell>
              <TableCell>
                <Button
                  className="mr-2"
                  color="primary"
                  size="sm"
                  onPress={() => editBtnHandler(doc)}
                >
                  修改
                </Button>
                <Button color="danger" size="sm">
                  删除
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* 模态框，用于填写新文档的标题和简介 */}
      <Modal
        aria-labelledby="new-doc-modal-title"
        isOpen={isOpen} // 模态框的打开和关闭的状态
        onOpenChange={onOpenChange} // 修改模态框的打开和关闭状态
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">新文档</ModalHeader>
              <ModalBody>
                <Input
                  aria-label="文档标题"
                  label="文档标题"
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                />
                <Textarea
                  aria-label="文档描述"
                  label="文档描述"
                  value={docDesc}
                  onChange={(e) => setDocDesc(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  aria-label="取消按钮"
                  color="danger"
                  variant="light"
                  onPress={onClose}
                >
                  取消
                </Button>
                <Button
                  aria-label="创建按钮"
                  color="primary"
                  onPress={addNewDoc}
                >
                  创建
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DocsPage;
