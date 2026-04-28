import { ENV } from "../../lib/env.js";

const corsLocally = {
    origin: ['http://localhost:5173' , 'http://127.0.0.1:5500'],
    methods: ['POST' , 'GET' , 'PUT' , 'DELETE' , 'OPTIONS' , 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}

const corsProdution = {
    origin: ['https://tailorgo.in', 'https://www.tailorgo.in'],
    methods: ['POST' , 'GET' , 'PUT' , 'DELETE' , 'OPTIONS' , 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}

export const corsOption  = ENV.NODE_ENV === 'production' ? corsProdution : corsLocally;