import type { Category, Transaction } from '../types'
import { v4 as uuidv4 } from 'uuid'

function daysAgo(n: number, hour = 12, minute = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, minute, 0, 0)
  return d
}

export function generateDemoTransactions(categories: Category[]): Transaction[] {
  const exp = categories.filter((c) => c.type === 'expense')
  const inc = categories.filter((c) => c.type === 'income')

  const byName = (list: Category[], name: string) =>
    list.find((c) => c.name === name) ?? list[0]

  const data: Array<[number, Category, number, number, string?]> = [
    [0, byName(exp, 'Еда'), 680, 13, 'Обед'],
    [0, byName(inc, 'Зарплата'), 85000, 9, 'Зарплата за месяц'],
    [0, byName(exp, 'Продукты'), 3240, 18, 'Продукты на неделю'],
    [1, byName(exp, 'Транспорт'), 250, 8, 'Метро'],
    [1, byName(inc, 'Фриланс'), 32000, 15, 'Проект для клиента'],
    [2, byName(exp, 'Кафе и рестораны'), 1450, 19],
    [2, byName(exp, 'Продукты'), 2150, 17, 'Супермаркет'],
    [3, byName(exp, 'Подписки'), 799, 12, 'Стриминговый сервис'],
    [4, byName(exp, 'Развлечения'), 2500, 20, 'Кино'],
    [5, byName(exp, 'Дом'), 15400, 10, 'Аренда'],
    [6, byName(exp, 'Покупки'), 3800, 14, 'Новая одежда'],
    [7, byName(exp, 'Здоровье'), 960, 11, 'Аптека'],
    [8, byName(exp, 'Транспорт'), 500, 18, 'Такси'],
    [9, byName(exp, 'Еда'), 540, 13, 'Завтрак'],
    [10, byName(exp, 'Продукты'), 2980, 19, 'Продукты на неделю'],
    [12, byName(inc, 'Подарки'), 5000, 16, 'День рождения'],
    [12, byName(exp, 'Образование'), 2400, 11, 'Курс'],
    [14, byName(exp, 'Дом'), 4600, 12, 'Коммунальные'],
    [15, byName(exp, 'Подписки'), 599, 10, 'Облачное хранилище'],
    [16, byName(exp, 'Здоровье'), 1500, 15, 'Витамины'],
    [18, byName(exp, 'Развлечения'), 1800, 21, 'Концерт'],
    [20, byName(exp, 'Продукты'), 4100, 13, 'Продукты на неделю'],
    [22, byName(exp, 'Транспорт'), 1900, 17, 'Заправка'],
    [24, byName(exp, 'Путешествия'), 8500, 9, 'Поездка'],
    [26, byName(inc, 'Инвестиции'), 1200, 12, 'Дивиденды'],
    [28, byName(exp, 'Покупки'), 2750, 15, 'Техника'],
    [29, byName(exp, 'Развлечения'), 2200, 20, 'Квест'],
  ]

  return data.map(([offset, category, amount, hour, comment]) => ({
    id: uuidv4(),
    type: category.type,
    amount,
    categoryId: category.id,
    date: daysAgo(offset, hour),
    comment,
    createdAt: daysAgo(offset, hour),
  }))
}