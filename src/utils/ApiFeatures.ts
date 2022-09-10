/* eslint-disable @typescript-eslint/no-explicit-any */

class ApiFeatures<T> {
   public query: any;
   public queryString: any;
   constructor(query: any, queryString: any) {
      this.query = query;
      this.queryString = queryString;
   }

   public filter() {
      this.query;
      this.queryString;
   }
}

export default ApiFeatures;
