import { Request, Response, NextFunction } from "express";
import Bus from "../models/bus";
import { BadRequestException } from "../exceptions/bad-requests";
import { ErrorCode } from "../exceptions/root";
import Ticket from "../models/ticket";
import { getTicketsSchema, purchaseTicketSchema } from "../schema/user";
import { UnprocessableEntity } from "../exceptions/validation";
import TicketPurchase from "../models/ticketPurchase";

// Get all buses
export const getAllBuses = async (req: Request, res: Response, next: NextFunction) => {

    const buses = await Bus.find();

    if (buses.length === 0) {
        return next(new BadRequestException('Bus not found', ErrorCode.BUS_NOT_FOUND));
    }

    // If buses are found, send them in the response
    res.status(200).json({ buses });

};


export const getAvailableTickets = async (req: Request, res: Response, next: NextFunction) => {

    console.log(req.body)
    const parsed = getTicketsSchema.safeParse(req.body);
    if (!parsed.success) {
        return next(new UnprocessableEntity(parsed.error.errors, "Validation Error"));
    }

    const { busId, date } = parsed.data;

    if (!busId || !date) {
        return next(new BadRequestException("All fields are required", ErrorCode.MISSING_FIELDS));
    }


    const tickets = await Ticket.find({ bus: busId, date })
        .populate('bus', 'name source destination departure_time arrival_time') // Populate bus details
        .exec();

    if (tickets.length === 0) {
        return next(new BadRequestException('Ticket not found', ErrorCode.TICKET_NOT_FOUND));
    }

    // Return the list of tickets
    res.status(200).json({ tickets });

};


export const purchaseTicket = async (req: Request, res: Response, next: NextFunction) => {
    const parsed = purchaseTicketSchema.safeParse(req.body);
    if (!parsed.success) {
        console.error(parsed.error.errors);
        return next(new UnprocessableEntity(parsed.error.errors, "Validation Error"));
    }

    const { busId, time_slot, seats_requested, userId } = parsed.data;
    console.log(parsed.data);

    try {
        const ticket = await Ticket.findOne({ bus: busId, time_slot });
        console.log(ticket);

        if (!ticket) {
            return next(new BadRequestException('No ticket available for this bus and time slot', ErrorCode.TICKET_NOT_FOUND));
        }

        if (ticket.seats_available < seats_requested) {
            return next(new BadRequestException('Not enough seats available', ErrorCode.TICKET_NOT_FOUND));
        }

        ticket.seats_available -= seats_requested;
        await ticket.save();

        const ticketPurchase = new TicketPurchase({
            userId,
            busId,
            timeSlot: time_slot,
            seatsPurchased: seats_requested,
            purchaseDate: new Date(),
        });

        await ticketPurchase.save();

        res.status(200).json({
            message: 'Ticket purchased successfully',
            ticket: {
                bus: busId,
                time_slot,
                seats_purchased: seats_requested,
                remaining_seats: ticket.seats_available
            },
            purchaseDetails: {
                purchaseDate: ticketPurchase.purchaseDate,
                seatsPurchased: ticketPurchase.seatsPurchased,
                userId: ticketPurchase.userId,
            }
        });
    } catch (error:any) {
        console.error(error);

        let errorCode = 1010; // Default unknown error code
        let errorMessage = 'An unknown error occurred.';
        
        if (error instanceof BadRequestException || error instanceof UnprocessableEntity) {
            errorMessage = error.message;
            errorCode = error.errorCode;
        }

        res.status(500).json({
            message: errorMessage,
            errorCode: errorCode,
            errors: error.errors || null
        });
    }
};
