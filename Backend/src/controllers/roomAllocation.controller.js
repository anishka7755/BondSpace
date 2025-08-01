import RoomAllocation from "../models/roomAllocation.model.js";
import Room from "../models/room.model.js";
import ConnectionRequest from "../models/connectionRequest.model.js";

// Helper: get max capacity for room type
const roomCapacity = (room) => (room.type === "Twin" ? 2 : 1);

// Helper: check if room has available spots
const isRoomAvailable = (room) => room.occupants.length < roomCapacity(room);

export const createRoomAllocation = async (matchId, session = null) => {
  try {
    // Find existing allocation with optional session
    let allocation = session
      ? await RoomAllocation.findOne({ matchId }).session(session)
      : await RoomAllocation.findOne({ matchId });

    if (allocation) return allocation;

    // Fetch connection request to get allocator info
    const connectionRequest = session
      ? await ConnectionRequest.findById(matchId).session(session)
      : await ConnectionRequest.findById(matchId);

    if (!connectionRequest) {
      throw new Error("Connection request not found");
    }

    allocation = new RoomAllocation({
      matchId,
      allocatorUserId: connectionRequest.senderUserId,
      selectedRoomId: null,
      isConfirmed: false,
    });

    if (session) {
      await allocation.save({ session });
    } else {
      await allocation.save();
    }

    return allocation;
  } catch (error) {
    console.error("Error creating room allocation:", error);
    throw error;
  }
};

/**
 * Get RoomAllocation by connection request id (matchId)
 */
export const getRoomAllocationByMatchId = async (req, res) => {
  try {
    const { matchId } = req.params;

    const allocation = await RoomAllocation.findOne({ matchId })
      .populate("selectedRoomId")
      .populate("allocatorUserId", "firstName lastName email");

    if (!allocation) {
      return res.status(404).json({ message: "Room allocation not found" });
    }

    res.json(allocation);
  } catch (error) {
    console.error("Error fetching room allocation:", error);
    res.status(500).json({ message: "Error fetching room allocation" });
  }
};

/**
 * Allocator selects a room for allocation and confirms it
 */
export const selectRoomForAllocation = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { roomId } = req.body;
    const userId = req.user._id || req.user.id;  

    const allocation = await RoomAllocation.findOne({ matchId });
    if (!allocation) {
      return res.status(404).json({ message: "Room allocation not found" });
    }

    if (!allocation.allocatorUserId.equals(userId)) {
      return res.status(403).json({ message: "Not authorized to select room" });
    }

    if (allocation.isConfirmed) {
      return res.status(400).json({ message: "Room allocation already confirmed" });
    }

    const room = await Room.findById(roomId).populate("occupants");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!isRoomAvailable(room)) {
      return res.status(400).json({ message: "Selected room is full" });
    }

    // Fetch connection request to get both users
    const connectionRequest = await ConnectionRequest.findById(matchId);
    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    // Update allocation document
    allocation.selectedRoomId = roomId;
    allocation.isConfirmed = true;
    await allocation.save();

    // Add both users as occupants of the room if not already added
    const occupantsToAdd = new Set([
      connectionRequest.senderUserId.toString(),
      connectionRequest.receiverUserId.toString(),
    ]);

    occupantsToAdd.forEach((userIdStr) => {
      if (!room.occupants.find((o) => o._id.toString() === userIdStr)) {
        room.occupants.push(userIdStr);
      }
    });

    // Mark room occupied if capacity reached
    room.isOccupied = room.occupants.length >= roomCapacity(room);
    await room.save();

    res.json({ message: "Room allocated successfully", allocation });
  } catch (error) {
    console.error("Error selecting room for allocation:", error);
    res.status(500).json({ message: "Error selecting room for allocation" });
  }
};

/**
 * Chat feature placeholders
 */
export const getChatMessages = async (req, res) => {
  res.status(501).json({ message: "Chat feature not implemented yet" });
};

export const postChatMessage = async (req, res) => {
  res.status(501).json({ message: "Chat feature not implemented yet" });
};
