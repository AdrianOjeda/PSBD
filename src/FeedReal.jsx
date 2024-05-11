import React from "react";
import DisplayBooks from "./DisplayBooks";
import Header from "./Header";
function FeedReal() {

    return (
        <div className="feed">
            <Header/>
            <div>
                <DisplayBooks/>
            </div>
        </div>
    );
}

export default FeedReal;
