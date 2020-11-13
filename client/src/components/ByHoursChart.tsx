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

export default function ByDaysChart() {

    const [day, setDay] = useState<dateWithCount[]>([])
    const [startDate, setStartDate] = useState<any>(new Date());

    useEffect(() => {
        const diff = moment().diff(startDate, "days");
        const fetchEvents = async () => {
            const day = (await axios.get(`/by-hours/${diff}`)).data
            setDay(day)
        }
        fetchEvents()
    },[])
    useEffect(() => {
        const updateWeek = async () => {
            const diff = moment().diff(startDate, "days");
            const day = (await axios.get(`/by-hours/${diff}`)).data
            setDay(day)
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
                <Title>Sessions (Hours):</Title>
                <Calendar 
                    selected={startDate} 
                    onChange={date => setStartDate(date)}
                />
                <LineChart width={850} height={325} data={day}>
                    <Line
                      name={'sessions'}
                      type="monotone"
                      dataKey="count"
                      stroke="blue"
                    />
                    <CartesianGrid stroke="black" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                </LineChart>
            </div>
        </>
    )
}