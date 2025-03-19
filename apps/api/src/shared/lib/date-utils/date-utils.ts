import { addYears, isAfter, isBefore } from 'date-fns'
import { addDays } from 'date-fns';
import { toZonedTime, format } from 'date-fns-tz';


export class DateUtils {
	static isAfterCurrentDate(date: Date): boolean {
    const currentDate = new Date()
    return isAfter(currentDate, date)
  }

  static areDatesInValidOrder(date1: Date, date2: Date): boolean {
    return isAfter(date1, date2) || isAfter(date2, date1)
  }

  static isMoreThanTwoYearsInFuture(date: Date, currentDate: Date): boolean {
    return isAfter(date, addYears(currentDate, 2))
  }

  static validateProjectDates(beginProject: string[]) {
    const currentDate = new Date()
    const [beginDate1, beginDate2] = beginProject.map(dateStr => new Date(dateStr))


    if (this.isAfterCurrentDate(beginDate1) || this.isAfterCurrentDate(beginDate2)) {
      console.log('beginDate1', beginDate1)
      console.log('currentDate', currentDate)
      console.error('Erro: Data de início do projeto está no passado')
      throw new Error('Project start date cannot be in the past')
    }

    // if (!isBefore(new Date(beginDate1), new Date(beginDate2))) {
    //   throw new Error('beginDate1 must be before beginDate2')
    // }

    if (!this.areDatesInValidOrder(beginDate1, beginDate2)) {
      console.error('Erro: Datas não estão em ordem válida')
      throw new Error('One project start date must be later than the other');
    }

    if (this.isMoreThanTwoYearsInFuture(beginDate1, currentDate) || this.isMoreThanTwoYearsInFuture(beginDate2, currentDate)) {
      console.error('Erro: Data de início do projeto está muito no futuro')
      throw new Error('Project start date cannot be more than 2 years in the future')
    }
  }

  static generateFutureDate(days: number) {
    const timeZone = 'America/New_York'
    const now = new Date();
    const zonedNow = toZonedTime(now, timeZone)
    const futureDate = addDays(zonedNow, days)
    const formattedDate = format(futureDate, 'yyyy-MM-dd HH:mm:ssXXX', { timeZone })
    return new Date(formattedDate)
  }
}