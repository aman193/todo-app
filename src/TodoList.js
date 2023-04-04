import React, { useState, useEffect } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  DatePicker,
  Select,
  Popconfirm,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import moment from "moment";
import { fetchTodoList, create, handleDelete } from "./Functions.js/CRUD";
const TodoList = () => {
  const Option = Select;
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState("");
  const [open, setOpen] = useState(false);
  const tags = [
    { text: "Tag1", value: "Tag1" },
    { text: "Tag2", value: "Tag2" },
  ];

  const status = [
    { text: "OPEN", value: "OPEN" },
    { text: "WORKING", value: "WORKING" },
    { text: "DONE", value: "DONE" },
    { text: "OVERDUE", value: "OVERDUE" },
  ];

  const columns = [
    {
      title: "Timestamp created",
      dataIndex: "timestamp",
      sorter: (a, b) => a.timestamp - b.timestamp,
      render: (timestamp) => new Date(timestamp).toLocaleString(),
    },
    {
      title: "Title",
      dataIndex: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      ellipsis: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      sorter: (a, b) => a.description.localeCompare(b.description),
      ellipsis: true,
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      sorter: (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
      render: (dueDate) => new Date(dueDate).toLocaleDateString(),
    },
    {
      title: "Tag",
      dataIndex: "tags",
      filters: tags,
      onFilter: (value, record) => record.tags.includes(value),
      render: (tags) => tags.join(", "),
    },
    {
      title: "Status",
      dataIndex: "status",
      filters: status,
      onFilter: (value, record) => record.status === value,
      render: (status) => status.toUpperCase(),
    },
    {
      title: "Action",
      render: (_, record) => (
        <div style={{ display: "flex" }}>
          <Button onClick={(e) => handleEdit(record)}>
            <EditOutlined />
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this record?"
            onConfirm={() => {
              handleDelete(record, setData);
            }}
          >
            <Button danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const getData = async () => {
    await fetchTodoList(setData);
  };

  useEffect(() => {
    setLoading(true);
    getData();
    setPagination({ ...pagination, total: data.length });
    setLoading(false);
  }, [pagination.current, pagination.pageSize]);

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
  };

  const handleAdd = () => {
    setOpen(true);
    setIsEditing(false);
    form.resetFields();
  };

  const handleEdit = async (record) => {
    setOpen(true);
    setIsEditing(true);
    setEditingKey(record.Id);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      dueDate: record.dueDate ? moment(record.dueDate) : null,
      tags: record.tags,
      status: record.status,
    });
  };

  const onCreate = async (values, isEditing, editingKey) => {
    try {
      await create(values, isEditing, editingKey);
      form.resetFields();
      setIsEditing(false);
      setEditingKey("");
      setOpen(false);
      await getData();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <Input.Search
          placeholder="Search tasks"
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={(value) => setSearchText(value)}
        />
        <Button
          type="primary"
          style={{ float: "left", margin: "1rem 0" }}
          onClick={handleAdd}
        >
          Add Task
        </Button>
      </div>
      <Table
        dataSource={data.filter(
          (record) =>
            record.title.toLowerCase().includes(searchText.toLowerCase()) ||
            record.description
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            record.tags.some((tag) =>
              tag.toLowerCase().includes(searchText.toLowerCase())
            )
        )}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        columns={columns}
      >
        {}
      </Table>
      <div>
        <CollectionCreateForm
          open={open}
          onCreate={onCreate}
          onCancel={() => {
            setOpen(false);
          }}
          form={form}
        />
      </div>
    </div>
  );
};

export default TodoList;

const CollectionCreateForm = ({ open, onCreate, onCancel, form }) => {
  return (
    <Modal
      open={open}
      title="Create a new collection"
      okText="Create"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((res) => {
            onCreate(res);
          })
          .catch((err) => {
            console.log(err);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{ modifier: "public" }}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[
            {
              required: true,
              message: "Title is required",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input type="textarea" />
        </Form.Item>
        <Form.Item name="dueDate" label="Due Date">
          <DatePicker />
        </Form.Item>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Form.Item
            name="tags"
            label="Tags[multiple]"
            rules={[
              {
                required: true,
                message: "Tag is required",
                type: "array",
              },
            ]}
            style={{ width: "40%" }}
          >
            <Select mode="multiple" placeholder="Please select Tags">
              <Option value="tag1">Tag1</Option>
              <Option value="tag2">Tag2</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[
              {
                required: true,
                message: "Status is required",
                type: "string",
              },
            ]}
            style={{ width: "40%" }}
          >
            <Select mode="single" placeholder="Please select Status">
              <Option value="OPEN">OPEN</Option>
              <Option value="WORKING">WORKING</Option>
              <Option value="DONE">DONE</Option>
              <Option value="OVERDUE">OVERDUE</Option>
            </Select>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};
