import { prisma } from './prisma';

interface RecurrencePattern {
  pattern: 'weekly' | 'daily';
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  timezone: string;
}

/**
 * Generate class instances for a class based on its recurrence pattern
 * @param classId - The ID of the class
 * @param startDate - Start date for generating instances
 * @param endDate - End date for generating instances
 */
export async function generateClassInstances(
  classId: string,
  startDate: Date,
  endDate: Date
) {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
  });

  if (!classData) {
    throw new Error('Class not found');
  }

  const recurrencePattern = classData.recurrencePattern as RecurrencePattern;
  const instances = [];
  const currentDate = new Date(startDate);

  // Parse start time (HH:MM format)
  const [startHour, startMinute] = classData.startTime.split(':').map(Number);
  const [endHour, endMinute] = classData.endTime.split(':').map(Number);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();

    // Check if this day matches the recurrence pattern
    let shouldCreate = false;

    if (recurrencePattern.pattern === 'daily') {
      shouldCreate = true;
    } else if (recurrencePattern.pattern === 'weekly') {
      shouldCreate = recurrencePattern.daysOfWeek?.includes(dayOfWeek) ?? false;
    }

    if (shouldCreate) {
      const scheduledStartTime = new Date(currentDate);
      scheduledStartTime.setHours(startHour, startMinute, 0, 0);

      const scheduledEndTime = new Date(currentDate);
      scheduledEndTime.setHours(endHour, endMinute, 0, 0);

      // Check if instance already exists
      const existing = await prisma.classInstance.findFirst({
        where: {
          classId,
          scheduledDate: {
            gte: new Date(currentDate.setHours(0, 0, 0, 0)),
            lt: new Date(currentDate.setHours(23, 59, 59, 999)),
          },
        },
      });

      if (!existing) {
        instances.push({
          classId,
          scheduledDate: new Date(currentDate),
          scheduledStartTime,
          scheduledEndTime,
          status: 'scheduled',
        });
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Create all instances in bulk
  if (instances.length > 0) {
    await prisma.classInstance.createMany({
      data: instances,
      skipDuplicates: true,
    });
  }

  return instances.length;
}

/**
 * Generate instances for the next N weeks (default 4)
 */
export async function generateWeeklyInstances(
  classId: string,
  weeks: number = 4
) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + weeks * 7);

  return generateClassInstances(classId, startDate, endDate);
}
