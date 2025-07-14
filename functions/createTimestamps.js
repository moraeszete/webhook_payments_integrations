function pad (n) {
  return +n < 10 ? '0' + +n : +n
}

module.exports = {
  create: async function () {
    const createdAt = new Date()
    const createdAtOnlyDate = createdAt.toLocaleDateString('pt-br')
    const createdAtIntl = createdAt.toISOString().split('T')[0]
    const createdAtLocale = createdAt.toLocaleDateString("pt-BR") + ' ' + pad(createdAt.getHours()) + ':' + pad(createdAt.getMinutes()) + ':' + pad(createdAt.getSeconds())
    const createdAtPosix = Date.now()
    const weekDay = this.getWeekdayFromDay(createdAt.getDay())
    const month = this.getMonthFromMonth(createdAt.getMonth())
    const year = createdAt.getFullYear()
    const dom = createdAt.getDate()

    return {
      createdAt,
      createdAtLocale,
      createdAtPosix,
      createdAtOnlyDate,
      createdAtInFullLong: `${weekDay.long}, ${dom} de ${month.long}`,
      createdAtInFullShort: `${weekDay.short}, ${dom} de ${month.short}`,
      createdAtYear: year,
      createdAtIntl
    }
  },
  getWeekdayFromDay (day) {
    const arrDays = {
      long: [
        'Domingo',
        'Segunda',
        'Terça',
        'Quarta',
        'Quinta',
        'Sexta',
        'Sábado'
      ],
      short: [
        'Dom',
        'Seg',
        'Ter',
        'Qua',
        'Qui',
        'Sex',
        'Sab'
      ]
    }
    return { long: arrDays.long[day], short: arrDays.short[day] }
  },
  getMonthFromMonth (month) {
    const arrMonths = {
      long: [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro'
      ],
      short: [
        'Jan',
        'Fev',
        'Mar',
        'Abr',
        'Mai',
        'Jun',
        'Jul',
        'Ago',
        'Set',
        'Out',
        'Nov',
        'Dez'
      ]
    }
    return { long: arrMonths.long[month], short: arrMonths.short[month] }
  },
  getWeekOfYear (date) {
    const oneJan = new Date(date.getFullYear(), 0, 1)
    const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000))
    return Math.ceil(( date.getDay() + 1 + numberOfDays) / 7)
  },
  createDateAndDateLocale ({ date, inputFormat }) {
    let dateLocale
    let dateIntl
    let year
    if (!date) {
      date = new Date()
      let day = date.getDate()
      let month = +date.getMonth() + 1
      year = date.getFullYear()
      dateIntl = year + '-' + pad(month) + '-' + pad(day)
      dateLocale = pad(day) + '/' + pad(month) + '/' + year
      date = new Date(year, month - 1, day, 0, 0, 0, 0)
    } else {
      let dateSplit
      inputFormat = inputFormat.toUpperCase()
      if (inputFormat === 'DD/MM/YYYY') {
        dateLocale = date
        dateSplit = date.split('/')
        date = new Date(dateSplit[2], +dateSplit[1] - 1, dateSplit[0])
        year = +dateSplit[2]
        dateIntl = dateSplit[2] + '-' + pad(dateSplit[1]) + '-' + pad(dateSplit[0])
      } else if (inputFormat === 'YYYY-MM-DD') {
        dateSplit = date.split('-')
        dateIntl = date
        year = +dateSplit[0]
        date = new Date(dateSplit[0], +dateSplit[1] - 1, dateSplit[2])
        dateLocale = pad(dateSplit[2]) + '/' + pad(dateSplit[1]) + '/' + dateSplit[0]
      } else if (inputFormat === 'date') {
        let day = date.getDate()
        let month = +date.getMonth() + 1
        year = +date.getFullYear()
        dateIntl = year + '-' + pad(month) + '-' + pad(day)
        dateLocale = pad(day) + '/' + pad(month) + '/' + year
      }
    }
    const dayOfWeek = this.getWeekdayFromDay(date.getDay())
    return { date, dateLocale, dateIntl, dayOfWeek, year}
  },
  getDateOptions () {
    const dates = []
    let date = new Date()

    for(let i = 0; i < 6; i++) {
      dates.push(date.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric'}))
      date.setMonth(date.getMonth() -1)
    }
    return dates
  }
  
}