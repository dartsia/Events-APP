import { Request as Req, Response as Res } from 'express';
import prisma from '../src/prismaClient';

const createEvent = async (req: Req, res: Res): Promise<void> => {
    const { name, description, date, location, maxParticipants } = req.body;
    
    if (!name || !description || !date || !location) {
        res.status(400).json({ message: 'Title, description, date, and location are required.' });
        return;
    }
    
    try {
        const newEvent = await prisma.event.create({
        data: {
            name,
            description,
            date,
            location,
            maxParticipants: maxParticipants || null,
        }
        });
    
        res.status(201).json({
        message: 'Event created successfully.',
        event: newEvent
        });
    } catch (err: any) {
        console.error('Event creation error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getAllEvents = async (req: Req, res: Res): Promise<void> => {
    try {
        const events = await prisma.event.findMany();
        res.status(200).json(events);
    } catch (err: any) {
        console.error('Error fetching events:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const updateEvent = async (req: Req, res: Res): Promise<void> => {
    const { id } = req.params;
    const { name, description, date, location, maxParticipants } = req.body;
    
    try {
        const updatedEvent = await prisma.event.update({
            where: { id: Number(id) },
            data: {
                name,
                description,
                date,
                location,
                maxParticipants: maxParticipants || null,
            }
        });
    
        res.status(200).json({
            message: 'Event updated successfully.',
            event: updatedEvent
        });
    } catch (err: any) {
        console.error('Event update error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const deleteEvent = async (req: Req, res: Res): Promise<void> => {
    const { id } = req.params;
    
    try {
        await prisma.event.delete({
            where: { id: Number(id) }
        });
    
        res.status(200).json({
            message: 'Event deleted successfully.'
        });
    } catch (err: any) {
        console.error('Event deletion error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getSpecificEvent = async (req: Req, res: Res): Promise<void> => {
    const { name } = req.query;

    try {
        const event = await prisma.event.findFirst({
            where: {
                name: {
                    equals: String(name).trim(),
                    mode: 'insensitive',
                }
            }
        });
    
        if (!event) {
            res.status(404).json({ message: 'Event not found.' });
            return;
        }
    
        res.status(200).json(event);
    } catch (err: any) {
        console.error('Error fetching event:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export default {
    createEvent,
    getAllEvents,
    updateEvent,
    deleteEvent,
    getSpecificEvent
}