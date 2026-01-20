export default function EmailConfig() {
    
  return (
    <div className="bg-gray-200 m-0">
    <div className="bg-white px-5 py-7 w-1/2 sm:w-auto m-3 h-9/11 rounded-lg shadow-md flex flex-col gap-6">
      <div>
        <h2 className="font-medium text-lg">Email Configuration</h2>
      </div>
      <div>
        <label htmlFor="subject" className="font-medium">
          Email Subject
        </label>
        <input
          type="text"
          className="border-none p-3 w-full my-1 bg-gray-200 rounded-lg font-normal font-mono"
          placeholder={"Your Certificate is ready"}
          name="subject"
        />
      </div>
      <div>
        <label htmlFor="body" className="font-medium">Email Body</label>
        <textarea
          className="p-3 w-full mt-1 h-42 bg-gray-200 border-none rounded-lg resize-y font-mono"
          name="body"
          placeholder="Dear {name},
Please find your certificate attached.
Best regards"
    
    ></textarea>
      </div>
      <h4 className="text-gray-500 font-normal">
        Use placeholders like &#123;name&#125;, &#123;email&#125;,
        &#123;position&#125; that will be replaced with actual data
      </h4>
    </div>

    <div className="flex justify-around items-center bg-white p-4 border-none rounded-lg shadow-md w-1/2 sm:w-auto h-16 m-3 ">
    <button className="bg-gray-200 border-none px-4 py-2 rounded-lg shadow-md hover:bg-gray-300">
      Preview Documents
    </button>
    <button className="bg-gray-200 border-none px-4 py-2 rounded-lg shadow-md hover:bg-gray-300">Send to {0} recipients</button>
    </div>
</div>
  );
}
