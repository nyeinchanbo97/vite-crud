import initialRenders from "./core/initialrenders";
import listeners from "./core/listeners";

class Course {
    init(){
        console.log("app start");
        initialRenders();
        listeners();
    }
}

export default Course;