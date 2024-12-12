import { Request, Response, NextFunction } from "express";
import { busSchema, ticketCreateSchema, ticketUpdateSchema } from "../schema/admin";
import Bus from "../models/bus";
import { UnprocessableEntity } from "../exceptions/validation";
import { BadRequestException } from "../exceptions/bad-requests";
import { ErrorCode } from "../exceptions/root";
import Ticket from "../models/ticket";

// Add a bus
export const addBus = async (req: Request, res: Response, next: NextFunction) => {

    const busData = busSchema.safeParse(req.body);
    if (!busData.success) {
        return next(new UnprocessableEntity(busData.error.errors, "Validation Error"));
    }
    const newBus = new Bus(busData.data);
    await newBus.save();

    res.status(201).json({ message: 'Bus added successfully', bus: newBus });
};

// Delete a bus
export const deleteBus = async (req: Request, res: Response, next: NextFunction) => {
    const busId = req.params.id;


    const deletedBus = await Bus.findByIdAndDelete(busId);

    if (!deletedBus) {
        return next(new BadRequestException('Bus not found', ErrorCode.BUS_NOT_FOUND));    }

    res.status(200).json({ message: 'Bus deleted successfully', bus: deletedBus });
};

// Update a bus
export const updateBus = async (req: Request, res: Response, next: NextFunction) => {
    const busId = req.params.id;

    const busData = busSchema.safeParse(req.body);
    if (!busData.success) {
        return next(new UnprocessableEntity(busData.error.errors, "Validation Error"));
    }

    const updatedBus = await Bus.findByIdAndUpdate(busId, busData.data, { new: true });

    if (!updatedBus) {
        return next(new BadRequestException('Bus not found', ErrorCode.BUS_NOT_FOUND));
    }

    res.status(200).json({ message: 'Bus updated successfully', bus: updatedBus });
};

// View all buses
export const viewAllBuses = async (req: Request, res: Response, next: NextFunction) => {
    const buses = await Bus.find();

    if (buses.length === 0) {
        return next(new BadRequestException('Bus not found', ErrorCode.BUS_NOT_FOUND));
    }

    return res.status(200).json({ buses });


};

// View bus by ID
export const viewBusById = async (req: Request, res: Response, next: NextFunction) => {
    const busId = req.params.id;


    const bus = await Bus.findById(busId);

    if (!bus) {
        return next(new BadRequestException('Bus not found', ErrorCode.BUS_NOT_FOUND));
    }

    res.status(200).json({ bus });
};

export const uploadTicket = async (req: Request, res: Response, next: NextFunction) => {
    // Validate request body using the schema
    const validatedData = ticketCreateSchema.safeParse(req.body);

    if (!validatedData.success) {
        
        return next(new UnprocessableEntity(validatedData.error.errors, 'Validation Error'));
    }

    // Destructure validated data from the safeParse result
    const { busId, price, time_slot, seats_available, date } = validatedData.data;

   
        // Find the bus by ID
        const bus = await Bus.findById(busId);
        if (!bus) {
            // If the bus is not found, return a 400 (Bad Request) error
            return next(new BadRequestException('Bus not found', ErrorCode.BUS_NOT_FOUND));
        }

        // Create a new ticket
        const newTicket = new Ticket({
            bus: busId,
            price,
            time_slot,
            seats_available,
            date
        });

        // Save the ticket to the database
        await newTicket.save();

        // Return a success response with the new ticket details
        res.status(201).json({ message: 'Ticket created successfully', ticket: newTicket })
};

// Update a specific ticket
export const updateTicket = async (req: Request, res: Response, next: NextFunction) => {
    const { ticketId } = req.params;

   
        const validatedData = ticketUpdateSchema.parse(req.body); 
        // Find and update the ticket
        const updatedTicket = await Ticket.findByIdAndUpdate(
            ticketId,
            validatedData,
            { new: true }
        );

        if (!updatedTicket) {
            return next(new BadRequestException('Ticket not found', ErrorCode.TICKET_NOT_FOUND));
        }

        res.status(200).json({ message: 'Ticket updated successfully', ticket: updatedTicket });
    
};

// Delete a ticket
export const deleteTicket = async (req: Request, res: Response, next: NextFunction) => {
    const { ticketId } = req.params;

   
        // Find and delete the ticket
        const deletedTicket = await Ticket.findByIdAndDelete(ticketId);
        if (!deletedTicket) {
            return next(new BadRequestException('Ticket not found', ErrorCode.TICKET_NOT_FOUND));        }

        res.status(200).json({ message: 'Ticket deleted successfully' });
   
};


