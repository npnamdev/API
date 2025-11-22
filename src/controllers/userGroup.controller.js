const UserGroup = require('../models/userGroup.model');

// Lấy tất cả nhóm
exports.getAllUserGroups = async (req, reply) => {
  try {
    const { page = 1, limit = 10, search = '', sort = 'desc' } = req.query;
    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.max(1, parseInt(limit));
    const skip = (pageNumber - 1) * pageSize;

    const searchQuery = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    const sortOrder = sort === 'asc' ? 1 : -1;

    const groups = await UserGroup.find(searchQuery)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: sortOrder })
      .populate('students')
      .populate('courses');

    const totalGroups = await UserGroup.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalGroups / pageSize);

    reply.send({
      status: 'success',
      message: 'User groups retrieved successfully',
      data: groups,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalGroups,
        limit: pageSize,
      },
    });
  } catch (error) {
    reply.code(500).send({
      status: 'error',
      message: error.message || 'Server error',
    });
  }
};


// Lấy nhóm theo ID
exports.getUserGroupById = async (req, reply) => {
  try {
    const group = await UserGroup.findById(req.params.id)
      .populate('students')
      .populate('courses');
    if (!group) return reply.code(404).send({ error: 'UserGroup not found' });
    reply.send(group);
  } catch (error) {
    reply.code(500).send({ error: 'Server error' });
  }
};

// Tạo nhóm mới
exports.createUserGroup = async (req, reply) => {
  try {
    const newGroup = new UserGroup(req.body);
    const savedGroup = await newGroup.save();
    reply.code(201).send(savedGroup);
  } catch (error) {
    reply.code(400).send({ error: error.message });
  }
};

// Cập nhật nhóm
exports.updateUserGroup = async (req, reply) => {
  try {
    const updatedGroup = await UserGroup.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updatedGroup) return reply.code(404).send({ error: 'UserGroup not found' });
    reply.send(updatedGroup);
  } catch (error) {
    reply.code(400).send({ error: error.message });
  }
};

// Xoá nhóm
exports.deleteUserGroup = async (req, reply) => {
  try {
    const deletedGroup = await UserGroup.findByIdAndDelete(req.params.id);
    if (!deletedGroup) return reply.code(404).send({ error: 'UserGroup not found' });
    reply.send({ message: 'UserGroup deleted successfully' });
  } catch (error) {
    reply.code(500).send({ error: 'Server error' });
  }
};

// Xoá nhiều nhóm
exports.deleteMultipleUserGroups = async (req, reply) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return reply.code(400).send({ status: 'error', message: 'Invalid or empty ids array' });
    }

    // Find groups to delete
    const groups = await UserGroup.find({ _id: { $in: ids } });

    if (groups.length === 0) {
      return reply.code(404).send({ status: 'error', message: 'No user groups found with provided ids' });
    }

    // Delete the groups
    const deleteResult = await UserGroup.deleteMany({ _id: { $in: ids } });

    reply.send({
      status: 'success',
      message: `Deleted ${deleteResult.deletedCount} user groups successfully.`,
      data: {
        deletedCount: deleteResult.deletedCount,
      },
    });
  } catch (error) {
    reply.code(500).send({ status: 'error', message: error.message || 'Server error' });
  }
};


// Thêm người dùng vào nhóm
exports.addUserToGroup = async (req, reply) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await UserGroup.findById(groupId);
    if (!group) return reply.code(404).send({ error: 'UserGroup not found' });

    // Tránh thêm trùng người dùng
    if (!group.students.includes(userId)) {
      group.students.push(userId);
      await group.save();
    }

    reply.send({
      status: 'success',
      message: 'User added to group successfully',
      data: group
    });
  } catch (error) {
    reply.code(500).send({ error: error.message || 'Server error' });
  }
};

// Xoá người dùng khỏi nhóm
exports.removeUserFromGroup = async (req, reply) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await UserGroup.findById(groupId);
    if (!group) return reply.code(404).send({ error: 'UserGroup not found' });

    group.students = group.students.filter(id => id.toString() !== userId);
    await group.save();

    reply.send({
      status: 'success',
      message: 'User removed from group successfully',
      data: group
    });
  } catch (error) {
    reply.code(500).send({ error: error.message || 'Server error' });
  }
};

