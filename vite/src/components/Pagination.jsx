import { Button } from "antd";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex justify-center items-center w-full mt-4">
            <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                type="primary"
                color="default"
                variant="outlined"
            >
                Prev
            </Button>

            <div
                className="max-w-[400px] overflow-x-auto flex space-x-1 px-2 py-1 inner scrollable-page-numbers items-center"
                style={{
                  scrollSnapType: "x mandatory",
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-x",
                  whiteSpace: "nowrap",
                }}
            >
                {pageNumbers.map((pageNumber) => (
                    <button
                        key={pageNumber}
                        onClick={() => onPageChange(pageNumber)}
                        className={`px-4 py-2 w-9 h-9 flex justify-center items-center text-center rounded-md ${currentPage === pageNumber ? "bg-white-500 text-dark shadow-xs border border-gray-400" : "bg-gray-300 text-black border-white"
                            } scroll-snap-align-start`}
                    >
                        {pageNumber}
                    </button>
                ))}
            </div>

            <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                type="primary"
                color="default"
                variant="outlined"
            >
                Next
            </Button>
        </div>
    );
};

export default Pagination;
