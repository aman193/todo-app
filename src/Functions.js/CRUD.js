import axios from "axios";
const ApiEndpoint = "https://642ace7f00dfa3b5474fa66a.mockapi.io/api/v1/tasks";
export const fetchTodoList = async (setData) => {
  try {
    const result = await axios.get(ApiEndpoint);
    setData(result.data);
  } catch (error) {
    console.log(error);
  }
};

export const handleDelete = async (record, setData) => {
  await axios.delete(`${ApiEndpoint}/${record.id}`);
  await fetchTodoList(setData);
};

export const create = async (values, isEditing, editingKey) => {
  try {
    const body = {
      title: values.title,
      description: values.description,
      dueDate: values.dueDate ? values.dueDate.toISOString() : null,
      tags: values.tags || [],
      status: values.status,
    };
    if (isEditing) {
      await axios.put(`${ApiEndpoint}/${editingKey}`, body);
    } else {
      await axios.post(ApiEndpoint, body);
    }
  } catch (error) {
    console.error(error);
  }
};
