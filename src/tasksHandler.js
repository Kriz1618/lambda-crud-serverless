const { v4 } = require('uuid');
const AWS = require('aws-sdk');
const middy = require('@middy/core');
const jsonBoddyParser = require('@middy/http-json-body-parser');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const addTask = async (event) => {
    try {
        const { title, description } = event.body;
    
        const newTask = {
            title,
            description,
            id: v4(),
            createdAt: new Date(),
            done: false,
        };
    
        await dynamodb.put({
            TableName: 'TaskTable',
            Item: newTask,
        }).promise();
    
        return {
            status: 200,
            body: newTask,
        }        
    } catch (error) {
        throw new Error(error.message);
    }
};

const getTasks = async (event) => {
    try {
        const result = await dynamodb.scan({
            TableName: 'TaskTable'
        }).promise();
    
        const tasks = result.Items;
    
        return {
            status: 200,
            tasks,
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

const getTask = async (event) => {
    try {
        const { id } = event.pathParameters;

        const result = await dynamodb.get({
            TableName: 'TaskTable',
            Key: { id },
        }).promise();
    
        const task = result.Item;
    
        return {
            status: 200,
            task,
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

const updateTask = async (event) => {
    try {
        const { id } = event.pathParameters;
        const { done, title, description } = event.body;
        const values = { ':done': done, ':updatedAt': new Date() };
        let expression = 'set done = :done, updatedAt = :updatedAt';

        if (title) {
            values[':title'] = title;
            expression = `${expression}, title = :title`;
        }
        if (description) {
            values[':description'] = description;
            expression = `${expression}, description = :description`;
        }

        const result = await dynamodb.update({
            TableName: 'TaskTable',
            Key: { id },
            UpdateExpression: expression,
            ExpressionAttributeValues: values,
            ReturnValues: 'ALL_NEW',
        }).promise();

        const task = result?.Attributes;
    
        return {
            task,
            result: 'Task updated successfully',
            status: 200,
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

const deleteTask = async (event) => {
    try {
        const { id } = event.pathParameters;

        await dynamodb.delete({
            TableName: 'TaskTable',
            Key: { id },
        }).promise();
    
        return {
            result: 'Task deleted successfully',
            status: 200,
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    getTasks,
    getTask,
    deleteTask,
    addTask: middy(addTask).use(jsonBoddyParser()),
    updateTask: middy(updateTask).use(jsonBoddyParser()),
};
