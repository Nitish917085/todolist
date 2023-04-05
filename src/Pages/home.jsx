import React, { useContext, useEffect, useRef, useState,Timestamp } from 'react';
import { InputNumber, Popconfirm, Typography,Table,Radio, Button, Modal,Space, Form, Input, DatePicker, Tag, Select, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import {mockData} from '../data';

const EditableContext = React.createContext(null);

//specifying which cells to be edited

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};


//------------   Adding new entry to collection ---------------------------------
const CollectionCreateForm = ({ open, onCreate, onCancel }) => {
  const [form] = Form.useForm();
  console.log("form"+form)
  const [value, setValue] = useState(['']);
  const onChangeStatus= (e) => {
    console.log('radio checked', e.target.value);
    setValue(e.target.value);
  };
  
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
          .then((values) => {
            form.resetFields();
            onCreate(values);
            console.log(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{
          modifier: 'public',
        }}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[
            {
              required: true,
              message: 'Please input the title of collection!',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item 
          name="description" 
          label="Description" 
            rules={[
            {
              required: true,
              message: 'Please input the description!',
            },
          ]}>
          <Input type="textarea" />
        </Form.Item>

        <Form.Item name="dueDate" label="Due Date">
              <input type="date" value="2017-06-01" />
        </Form.Item>

        <Form.Item name="tag" label="Tag">
           
          <Input type="textarea" />
        </Form.Item>

        <Form.Item name="status" label="Status"
            rules={[
            {
              required: true,
              message: 'Please specify Deu Date!',
            },
          ]}>
            <Radio.Group onChange={onChangeStatus} value={value}>
              <Space direction="vertical">
                <Radio value={'OPEN'} defaultChecked>OPEN</Radio>
                <Radio value={'WORKING'}>WORKING</Radio>
                <Radio value={'DONE'}>DONE</Radio>
                <Radio value={'OVERDUE'}>OVERDUE </Radio>
              </Space>
            </Radio.Group>
        </Form.Item>

      </Form>
    </Modal>
  );
};

//--------------------------------------------------------------------------------------------------
const Home = () => { 

  const [data,setData]=useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');  
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  };
  //====================================================================================
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
        </Space>
      </div>
    ),
    
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1890ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  //===================   Actions after edit buuton clicked===============================

  const handleDelete = (key) => {
    console.log(key);
    const newData = data.filter((item) => item.key !== key);
    setData(newData);
  };

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      name: '',
      age: '',
      address: '',
      ...record,
    });
    setEditingKey(record.key);
    console.log("key"+editingKey);
  };

  const cancel = () => {
    setEditingKey('');
  };
    // saving edited entry and validating
  const save = async (key) => {       
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {             //validation
      console.log('Validate Failed:', errInfo);
    }
  };
  //----------------------------------------------------------------------------
 // getting values after submiting new entry
  const onCreate = (values) => {   
    values["timestampCreated"]=new Date().toLocaleString();    
    console.log('Received values of form: ', values);
    setData([...data,values]);
    setOpen(false);
  };

  useEffect(()=>{
    setData(mockData);
  },[]);
  
  //************************************************************************************************** */
  // UI of columns and their prpperties
  const columns = [
    {
      title: 'Timestamp Created',
      dataIndex: 'timestampCreated',
      ...getColumnSearchProps('timestampCreated'),
      sorter: (a, b) => a.timestampCreated - b.timestampCreated,
      sortDirections: ['descend', 'ascend'],      
      editable: true,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      ...getColumnSearchProps('title'),
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortDirections: ['descend', 'ascend'],
      editable: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      ...getColumnSearchProps('description'),
      sorter: (a, b) => a.description.localeCompare(b.description),
      sortDirections: ['descend', 'ascend'],
      editable: true,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      ...getColumnSearchProps('dueDate'),
      sorter: (a, b) => a.dueDate - b.dueDate,
      sortDirections: ['descend', 'ascend'],
      editable: true,
    },
    {
      title: 'Tag',
      dataIndex: 'tag',      
      filterSearch: true,
      ...getColumnSearchProps('dueDate'),
      onFilter: (value, record) => record.tag.startsWith(value),
      editable: true,
    
    },
    {
      title: 'Status',
      dataIndex: 'status',
      filters: [
        {
          text: 'OPEN',
          value: 'OPEN',
        },
        {
          text: 'OVERDUE',
          value: 'OVERDUE',
        },
        {
          text: 'WORKING',
          value: 'WORKING 2',
        },
        {
          text: 'DONE',
          value: 'DONE',
        },
      ],
      // ...getColumnSearchProps('status'),

      ilteredValue: filteredInfo.status || null,
      filterSearch: true,
      // ...getColumnSearchProps('dueDate'),
      onFilter: (value, record) => record.status.startsWith(value),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <span>
              <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)} style={{
                marginRight: 8,
              }}>
                 Edit
              </Typography.Link>
              <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
                    <a>Delete</a>
              </Popconfirm>               
          </span>
        );
      },
    },
  ];
  //****************************************************************************************************** */
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType:'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  //---------------------------------------------------------------------------------
 
  return(
    <div style={{ backgroundColor:'lightsalmon',
        border:"5px solid brown", borderRadius:"20px", margin:"10px 10px"}}>

        <h3> To-do List</h3>
       
        <Button
          style={{margin:"10px 20px"}}
          type="primary"
          onClick={() => {
            setOpen(true);
          }}
        >
          New Collection
        </Button>

      <Form form={form} component={false}>
        <Table 
          style={{margin:"15px 15px"}}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          onChange={onChange}        
        />
      </Form>

      <CollectionCreateForm
        open={open}
        onCreate={onCreate}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </div>
 ) 
}
export default Home;