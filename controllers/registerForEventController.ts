import { Request as Req, Response as Res } from 'express';
import prisma from '../src/prismaClient';

const registerForEvent = async (req: Req, res: Res): Promise<void> => {
    const eventId = Number(req.params.id);
    const userId = req.user?.id || req.body.user_id;

    if (!eventId || !userId) {
        res.status(400).json({ message: 'Event ID and User ID are required.' });
        return;
    }

    const event = await prisma.event.findUnique({
        where: { id: eventId }, // assuming you have the event ID
    });

    if (!event) {
        res.status(404).json({ message: "Event not found." });
        return;
    }

    const count = await prisma.participant.count({ where: { eventId } });
    if (count >= event.maxParticipants!) {
        res.status(400).json({ message: "Event is full" });
        return;
    }


    try {
        const registration = await prisma.participant.create({
            data: {
                eventId,
                userId
            },
        });

        res.status(201).json({
            message: 'Registration successful.',
            registration,
        });
    } catch (err: any) {
        console.error('Registration error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export default {
    registerForEvent
};