const getOffset = (limit, page) => {
  return (page - 1) * limit
}

const getPagination = (limit, page, total) => {
  const totalPage = Math.ceil(total / limit)
  const currentPage = page < 1 ? 1 : page > totalPage ? totalPage : page
  const pages = Array.from({ length: totalPage }, (_, index) => index + 1)
  const prev = currentPage - 1 < 1 ? 1 : currentPage - 1
  const next = currentPage + 1 > totalPage ? totalPage : currentPage + 1
  return {
    totalPage,
    currentPage,
    pages,
    prev,
    next
  }
}

module.exports = {
  getOffset,
  getPagination
}
