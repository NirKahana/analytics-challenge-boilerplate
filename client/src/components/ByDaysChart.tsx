import React, { useEffect, useState } from 'react'
import axios from 'axios'
import moment from 'moment'
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styled from 'styled-components';


import {dateWithCount} from "../models/event"
const initalDateValue = new Date(moment().subtract(6, 'days').format("L"));

export default function ByDaysChart() {

    const [daysFromToday, setDaysFromToday] = useState<number>(6);
    const [week, setWeek] = useState<dateWithCount[]>([])
    
    const [startDate, setStartDate] = useState<any>(new Date(initalDateValue));

    useEffect(() => {
        const diff = moment().diff(startDate, "days");
        
        const fetchEvents = async () => {
            const week = (await axios.get(`/by-days/${diff}`)).data
            setWeek(week)
        }
        fetchEvents()
    },[])
    useEffect(() => {
        const updateWeek = async () => {
            const diff = moment().diff(startDate, "days");
            const week = (await axios.get(`/by-days/${diff}`)).data
            setWeek(week)
        }
        updateWeek();
    },[startDate])

    const Title = styled.h2`
        display: inline-block
    `;
    const Calendar = styled(DatePicker)`
        height: 30px;
        margin: 30px;
    `

    return (
        <>  
            <div>
                <Title>Sessions (Days):</Title>
                <Calendar 
                    selected={startDate} 
                    onChange={date => setStartDate(date)}
                />
                <LineChart width={850} height={325} data={week}>
                    <Line
                      name={'sessions'}
                      type="monotone"
                      dataKey="count"
                      stroke="blue"
                    />
                    <CartesianGrid stroke="black" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                </LineChart>
            </div>
        </>
    )
}